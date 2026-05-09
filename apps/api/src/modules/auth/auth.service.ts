import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
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
  set(
    key: string,
    value: string,
    mode: 'EX',
    duration: number,
  ): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
  ttl(key: string): Promise<number>;
  eval(
    script: string,
    numkeys: number,
    ...args: (string | number)[]
  ): Promise<unknown>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpExpiry: number;
  private readonly rateLimit: number;
  private readonly jwtSecret: string;
  private readonly jwtExpiry: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiry: string;
  private fixedOtpMap: Map<string, string> = new Map();

  private static readonly RATE_LIMIT_LUA = `
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return count
  `;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    @Inject(OTP_PROVIDER) private readonly otpProvider: OtpProvider,
  ) {
    this.otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);
    this.rateLimit = this.configService.get<number>('OTP_RATE_LIMIT', 5);
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'fallback-secret',
    );
    this.jwtExpiry = this.configService.get<string>('JWT_EXPIRY', '15m');
    this.refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'fallback-refresh-secret',
    );
    this.refreshExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRY',
      '30d',
    );
  }

  async onModuleInit(): Promise<void> {
    const rows = await this.prisma.fixedOtp.findMany({
      where: { isActive: true },
    });
    // Phone values in DB must be in normalized E.164 format (+91XXXXXXXXXX) — requestOtp looks up by normalized key.
    this.fixedOtpMap = new Map(rows.map((r) => [r.phone, r.otp]));
    this.logger.log(`Loaded ${this.fixedOtpMap.size} fixed OTPs`);
  }

  async requestOtp(phone: string): Promise<OtpRequestResponseDto> {
    const normalized = normalizeIndianPhone(phone);

    // Check for fixed OTP first (dev/QA bypass) — before rate limit check
    const fixedOtp = this.fixedOtpMap.get(normalized);
    if (fixedOtp) {
      await this.redis.set(`otp:${normalized}`, fixedOtp, 'EX', this.otpExpiry);
      this.logger.log(`[FIXED OTP] ${normalized}: using pinned OTP`);
      return { message: 'OTP sent', expiresIn: this.otpExpiry };
    }

    // Rate limit check — atomic via Lua to avoid INCR+EXPIRE race condition
    const count = (await this.redis.eval(
      AuthService.RATE_LIMIT_LUA,
      1,
      `otp_rate:${normalized}`,
      3600,
    )) as number;
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

    const accessToken = this.signToken(
      { sub: user.id, phone: user.phone },
      this.jwtSecret,
      this.jwtExpiry,
    );

    const jti = crypto.randomUUID();
    const refreshToken = this.signToken(
      { sub: user.id, jti },
      this.refreshSecret,
      this.refreshExpiry,
    );

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

    const newAccessToken = this.signToken(
      { sub: user.id, phone: user.phone },
      this.jwtSecret,
      this.jwtExpiry,
    );

    const newJti = crypto.randomUUID();
    const newRefreshToken = this.signToken(
      { sub: user.id, jti: newJti },
      this.refreshSecret,
      this.refreshExpiry,
    );

    await this.redis.set(
      `refresh:${user.id}:${newJti}`,
      '1',
      'EX',
      parseDuration(this.refreshExpiry),
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private signToken(
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: string,
  ): string {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
    return this.jwtService.sign(payload as any, {
      secret,
      expiresIn: expiresIn as any,
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
  }
}
