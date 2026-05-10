import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { AuthService } from './auth.service';
import { OTP_PROVIDER } from './providers/otp-provider.interface';

// Mock crypto to control OTP and UUID generation
/* eslint-disable @typescript-eslint/no-unsafe-return */
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomInt: jest.fn(() => 123456),
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));
/* eslint-enable @typescript-eslint/no-unsafe-return */

const mockPrisma = {
  fixedOtp: {
    findMany: jest.fn(),
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
  eval: jest.fn(),
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

    // Seed the in-memory fixed OTP map (normally called by NestJS lifecycle)
    mockPrisma.fixedOtp.findMany.mockResolvedValue([
      { phone: '+919999900001', otp: '123456', isActive: true },
    ]);
    await service.onModuleInit();
  });

  // -------------------------------------------------------------------------
  // requestOtp
  // -------------------------------------------------------------------------
  describe('requestOtp', () => {
    it('should generate and store an OTP for a valid phone number (happy path)', async () => {
      mockRedis.eval.mockResolvedValue(1); // first request, count = 1
      mockRedis.set.mockResolvedValue('OK');
      mockOtpProvider.sendOtp.mockResolvedValue(undefined);

      const result = await service.requestOtp('9876543210');

      expect(result).toEqual({ message: 'OTP sent', expiresIn: 300 });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'otp:+919876543210',
        '123456',
        'EX',
        300,
      );
      expect(mockOtpProvider.sendOtp).toHaveBeenCalledWith(
        '+919876543210',
        '123456',
      );
    });

    it('should use fixed OTP and NOT call the provider when phone has a pinned OTP', async () => {
      // +919999900001 is seeded in fixedOtpMap via onModuleInit in beforeEach
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.requestOtp('+919999900001');

      expect(result).toEqual({ message: 'OTP sent', expiresIn: 300 });
      expect(mockOtpProvider.sendOtp).not.toHaveBeenCalled();
      expect(mockRedis.eval).not.toHaveBeenCalled();
    });

    it('should throw TOO_MANY_REQUESTS when rate limit is exceeded', async () => {
      mockRedis.eval.mockResolvedValue(6); // count > rateLimit (5)
      mockRedis.ttl.mockResolvedValue(3600);

      await expect(service.requestOtp('9876543210')).rejects.toThrow(
        HttpException,
      );

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
      mockRedis.eval.mockResolvedValueOnce(1); // 1st attempt — within limit
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
      // Both OTP key and attempt counter must be deleted on success
      expect(mockRedis.del).toHaveBeenCalledWith(
        'otp:+919876543210',
        'otp_verify_attempts:+919876543210',
      );
      expect(mockPrisma.user.upsert).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when OTP is wrong', async () => {
      mockRedis.eval.mockResolvedValueOnce(1); // within limit
      mockRedis.get.mockResolvedValue('999999');

      await expect(service.verifyOtp('9876543210', '123456')).rejects.toThrow(
        new UnauthorizedException('Invalid OTP'),
      );
      // OTP must not be consumed on a failed verify attempt
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when Redis returns null (OTP expired)', async () => {
      mockRedis.eval.mockResolvedValueOnce(1); // within limit
      mockRedis.get.mockResolvedValue(null);

      await expect(service.verifyOtp('9876543210', '123456')).rejects.toThrow(
        new UnauthorizedException('OTP expired or not requested'),
      );
    });

    it('brute-force lockout: blocks after 5 failed attempts and kills OTP', async () => {
      // Simulate eval returning 6 (6th attempt — exceeds the 5-attempt limit)
      mockRedis.eval.mockResolvedValueOnce(6);

      await expect(
        service.verifyOtp('+919876543210', '000000'),
      ).rejects.toThrow(
        expect.objectContaining({ status: HttpStatus.TOO_MANY_REQUESTS }),
      );
      // OTP should be killed so attacker cannot continue guessing
      expect(mockRedis.del).toHaveBeenCalledWith('otp:+919876543210');
    });
  });

  // -------------------------------------------------------------------------
  // refreshTokens
  // -------------------------------------------------------------------------
  describe('refreshTokens', () => {
    const mockUser = { id: 'user-1', phone: '+919876543210', name: null };

    it('should rotate the refresh token and return a new token pair (happy path)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', jti: 'old-jti' });
      // Atomic del returns 1 — key existed and was deleted
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
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        jti: 'revoked-jti',
      });
      // Atomic del returns 0 — key was already gone (revoked or race-lost)
      mockRedis.del.mockResolvedValue(0);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
        new UnauthorizedException('Token revoked or already used'),
      );
    });
  });
});
