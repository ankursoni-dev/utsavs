import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { AuthService } from './auth.service';
import { OTP_PROVIDER } from './providers/otp-provider.interface';

// Mock crypto to control OTP and UUID generation
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomInt: jest.fn(() => 123456),
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

const mockPrisma = {
  fixedOtp: {
    findFirst: jest.fn(),
  },
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      OTP_EXPIRY_SECONDS: 300,
      OTP_RATE_LIMIT: 5,
      JWT_SECRET: 'test-secret',
      JWT_EXPIRY: '15m',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_REFRESH_EXPIRY: '30d',
    };
    return config[key] ?? defaultValue;
  }),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
};

const mockOtpProvider = {
  sendOtp: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: OTP_PROVIDER, useValue: mockOtpProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // -------------------------------------------------------------------------
  // requestOtp
  // -------------------------------------------------------------------------
  describe('requestOtp', () => {
    it('should generate and store an OTP for a valid phone number (happy path)', async () => {
      mockPrisma.fixedOtp.findFirst.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      mockRedis.set.mockResolvedValue('OK');
      mockOtpProvider.sendOtp.mockResolvedValue(undefined);

      const result = await service.requestOtp('9876543210');

      expect(result).toEqual({ message: 'OTP sent', expiresIn: 300 });
      expect(mockRedis.set).toHaveBeenCalledWith('otp:+919876543210', '123456', 'EX', 300);
      expect(mockOtpProvider.sendOtp).toHaveBeenCalledWith('+919876543210', '123456');
    });

    it('should use fixed OTP and NOT call the provider when phone has a pinned OTP', async () => {
      mockPrisma.fixedOtp.findFirst.mockResolvedValue({
        id: 'fixed-1',
        phone: '+919999900001',
        otp: '123456',
        isActive: true,
      });
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.requestOtp('+919999900001');

      expect(result).toEqual({ message: 'OTP sent', expiresIn: 300 });
      expect(mockOtpProvider.sendOtp).not.toHaveBeenCalled();
      expect(mockRedis.incr).not.toHaveBeenCalled();
    });

    it('should throw TOO_MANY_REQUESTS when rate limit is exceeded', async () => {
      mockPrisma.fixedOtp.findFirst.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(6); // count > rateLimit (5)
      mockRedis.ttl.mockResolvedValue(3600);

      await expect(service.requestOtp('9876543210')).rejects.toThrow(HttpException);

      // Verify the status code
      await expect(service.requestOtp('9876543210')).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
      });

      expect(mockOtpProvider.sendOtp).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for an invalid phone number', async () => {
      await expect(service.requestOtp('1234567890')).rejects.toThrow(
        'Invalid Indian mobile number',
      );
    });
  });

  // -------------------------------------------------------------------------
  // verifyOtp
  // -------------------------------------------------------------------------
  describe('verifyOtp', () => {
    const mockUser = { id: 'user-1', phone: '+919876543210', name: null };

    it('should return tokens when OTP is correct (happy path)', async () => {
      mockRedis.get.mockResolvedValue('123456');
      mockRedis.del.mockResolvedValue(1);
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.verifyOtp('9876543210', '123456');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'user-1', phone: '+919876543210', name: null },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('otp:+919876543210');
      expect(mockPrisma.user.upsert).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when OTP is wrong', async () => {
      mockRedis.get.mockResolvedValue('999999');

      await expect(service.verifyOtp('9876543210', '123456')).rejects.toThrow(
        new UnauthorizedException('Invalid OTP'),
      );
    });

    it('should throw UnauthorizedException when Redis returns null (OTP expired)', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.verifyOtp('9876543210', '123456')).rejects.toThrow(
        new UnauthorizedException('OTP expired or not requested'),
      );
    });
  });

  // -------------------------------------------------------------------------
  // refreshTokens
  // -------------------------------------------------------------------------
  describe('refreshTokens', () => {
    const mockUser = { id: 'user-1', phone: '+919876543210', name: null };

    it('should rotate the refresh token and return a new token pair (happy path)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', jti: 'old-jti' });
      mockRedis.get.mockResolvedValue('1');
      mockRedis.del.mockResolvedValue(1);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.refreshTokens('old-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1:old-jti');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'refresh:user-1:test-uuid-1234',
        '1',
        'EX',
        expect.any(Number),
      );
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    });

    it('should throw UnauthorizedException when jti is not in Redis (revoked)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', jti: 'revoked-jti' });
      mockRedis.get.mockResolvedValue(null);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
        new UnauthorizedException('Token revoked or already used'),
      );
    });
  });
});
