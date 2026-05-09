import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  phone: string;
}

export interface JwtUser {
  userId: string;
  phone: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'fallback-secret'),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    // JWT is signed by us and not expired — trust the payload.
    // User existence was verified at token issuance (verifyOtp) and refresh (refreshTokens).
    // Real-time revocation is handled via refresh token rotation (jti in Redis).
    // If user-ban mid-session is ever needed, add a Redis blacklist check here — not a DB call.
    return { userId: payload.sub, phone: payload.phone };
  }
}
