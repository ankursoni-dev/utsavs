import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { parseDuration } from '../../common/utils/duration.util';
import { normalizeIndianPhone } from '../../common/utils/phone.util';
import {
  AuthTokenResponseDto,
  OtpRequestResponseDto,
  TokenRefreshResponseDto,
} from './dto/auth-response.dto';
import { OTP_PROVIDER } from './providers/otp-provider.interface';
import type { OtpProvider } from './providers/otp-provider.interface';

interface RefreshPayload {
  sub: string;
  jti: string;
}

/**
 * Structural interface for the subset of ioredis `Redis` methods used in this service.
 * Avoids TS1272 (isolatedModules + emitDecoratorMetadata constraint on decorated parameters).
 */
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: 'EX', duration: number): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpExpiry: number;
  private readonly rateLimit: number;
  private readonly jwtSecret: string;
  private readonly jwtExpiry: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiry: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    @Inject(OTP_PROVIDER) private readonly otpProvider: OtpProvider,
  ) {
    this.otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);
    this.rateLimit = this.configService.get<number>('OTP_RATE_LIMIT', 5);
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'fallback-secret');
    this.jwtExpiry = this.configService.get<string>('JWT_EXPIRY', '15m');
    this.refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'fallback-refresh-secret',
    );
    this.refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '30d');
  }

  async requestOtp(phone: string): Promise<OtpRequestResponseDto> {
    const normalized = normalizeIndianPhone(phone);

    // Check for fixed OTP first (dev/QA bypass) — before rate limit check
    const fixedOtp = await this.prisma.fixedOtp.findFirst({
      where: { phone: normalized, isActive: true },
    });
    if (fixedOtp) {
      await this.redis.set(`otp:${normalized}`, fixedOtp.otp, 'EX', this.otpExpiry);
      this.logger.log(`[FIXED OTP] ${normalized}: using pinned OTP`);
      return { message: 'OTP sent', expiresIn: this.otpExpiry };
    }

    // Rate limit check
    const count = await this.redis.incr(`otp_rate:${normalized}`);
    if (count === 1) {
      await this.redis.expire(`otp_rate:${normalized}`, 3600);
    }
    if (count > this.rateLimit) {
      const ttl = await this.redis.ttl(`otp_rate:${normalized}`);
      throw new HttpException(
        {
          message: `Too many OTP requests. Try again in ${Math.ceil(ttl / 60)} minutes.`,
          error: 'TOO_MANY_REQUESTS',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.redis.set(`otp:${normalized}`, otp, 'EX', this.otpExpiry);
    await this.otpProvider.sendOtp(normalized, otp);

    return { message: 'OTP sent', expiresIn: this.otpExpiry };
  }

  async verifyOtp(phone: string, otp: string): Promise<AuthTokenResponseDto> {
    const normalized = normalizeIndianPhone(phone);

    const stored = await this.redis.get(`otp:${normalized}`);
    if (stored === null) {
      throw new UnauthorizedException('OTP expired or not requested');
    }
    if (stored !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Consume OTP (one-time use)
    await this.redis.del(`otp:${normalized}`);

    const user = await this.prisma.user.upsert({
      where: { phone: normalized },
      create: { phone: normalized },
      update: {},
    });

    // Cast expiresIn to any to bypass StringValue branded type — runtime value is valid ms notation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = this.jwtService.sign({ sub: user.id, phone: user.phone } as any, {
      secret: this.jwtSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.jwtExpiry as any,
    });

    const jti = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshToken = this.jwtService.sign({ sub: user.id, jti } as any, {
      secret: this.refreshSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.refreshExpiry as any,
    });

    await this.redis.set(
      `refresh:${user.id}:${jti}`,
      '1',
      'EX',
      parseDuration(this.refreshExpiry),
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone, name: user.name },
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenRefreshResponseDto> {
    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify<RefreshPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { sub, jti } = payload;

    const exists = await this.redis.get(`refresh:${sub}:${jti}`);
    if (!exists) {
      throw new UnauthorizedException('Token revoked or already used');
    }

    // Rotate: delete old, issue new
    await this.redis.del(`refresh:${sub}:${jti}`);

    const user = await this.prisma.user.findUnique({ where: { id: sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Cast expiresIn to any to bypass StringValue branded type — runtime value is valid ms notation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newAccessToken = this.jwtService.sign({ sub: user.id, phone: user.phone } as any, {
      secret: this.jwtSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.jwtExpiry as any,
    });

    const newJti = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newRefreshToken = this.jwtService.sign({ sub: user.id, jti: newJti } as any, {
      secret: this.refreshSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.refreshExpiry as any,
    });

    await this.redis.set(
      `refresh:${user.id}:${newJti}`,
      '1',
      'EX',
      parseDuration(this.refreshExpiry),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
