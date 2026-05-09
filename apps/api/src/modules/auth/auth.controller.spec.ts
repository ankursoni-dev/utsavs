import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './guards/public.decorator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  requestOtp: jest.fn(),
  verifyOtp: jest.fn(),
  refreshTokens: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('requestOtp', () => {
    it('should call authService.requestOtp and return the result', async () => {
      const expected = { message: 'OTP sent', expiresIn: 300 };
      mockAuthService.requestOtp.mockResolvedValue(expected);

      const result = await controller.requestOtp({ phone: '9876543210' });

      expect(mockAuthService.requestOtp).toHaveBeenCalledWith('9876543210');
      expect(result).toEqual(expected);
    });

    it('should be decorated with @Public()', () => {
      const reflector = new Reflector();
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.requestOtp);
      expect(isPublic).toBe(true);
    });
  });

  describe('verifyOtp', () => {
    it('should call authService.verifyOtp and return the result', async () => {
      const expected = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'user-1', phone: '+919876543210', name: null },
      };
      mockAuthService.verifyOtp.mockResolvedValue(expected);

      const result = await controller.verifyOtp({ phone: '9876543210', otp: '123456' });

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith('9876543210', '123456');
      expect(result).toEqual(expected);
    });

    it('should be decorated with @Public()', () => {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.verifyOtp);
      expect(isPublic).toBe(true);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens and return the result', async () => {
      const expected = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockAuthService.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refreshTokens({ refreshToken: 'some-refresh-token' });

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('some-refresh-token');
      expect(result).toEqual(expected);
    });

    it('should be decorated with @Public()', () => {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.refreshTokens);
      expect(isPublic).toBe(true);
    });
  });
});
