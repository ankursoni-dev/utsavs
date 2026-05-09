# Auth Module

## Purpose

Provides phone OTP-based authentication and JWT token management. Handles OTP request/verify, access/refresh token issuance, and jti-based refresh token rotation. Supports dev OTP bypass via FixedOtp table.

## Public surface

| Method | Route | Auth | Response | Notes |
|---|---|---|---|---|
| POST | `/auth/otp-request` | @Public | `{ message, expiresIn }` | Phone normalization; rate-limited (default 5/hour); FixedOtp bypass checked first |
| POST | `/auth/otp-verify` | @Public | `{ accessToken, refreshToken, user }` | Consumes OTP (one-time use); upserts user |
| POST | `/auth/token-refresh` | @Public | `{ accessToken, refreshToken }` | Rotates jti; old token revoked |

## Auth flow

1. **Request OTP**: Phone normalized to `+91XXXXXXXXXX`. FixedOtp table checked (dev/QA accounts skip send). Rate limit enforced (default 5 requests per hour per phone). OTP stored in Redis with TTL (default 300s).
2. **Verify OTP**: OTP retrieved, matched, then deleted (one-time use). User upserted by phone. Access token (15m) and refresh token (30d) issued.
3. **Refresh**: Refresh token verified; jti looked up in Redis. Old jti deleted, new one generated. Both tokens reissued.

## Internal structure

- **AuthService** — core logic: requestOtp, verifyOtp, refreshTokens
- **AuthController** — three endpoints, all marked @Public
- **JwtStrategy** — passport strategy; validates JWT_SECRET; loads user from DB
- **JwtAuthGuard** — opt-in guard; respects @Public decorator; imported by other modules via AuthModule export
- **OTP_PROVIDER** — injection token (DevOtpProvider or Msg91OtpProvider via factory based on MSG91_AUTH_KEY)

## Dependencies

- **Prisma** — upserts User, queries FixedOtp table
- **Redis** (REDIS_CLIENT token) — stores `otp:{phone}`, `otp_rate:{phone}`, `refresh:{userId}:{jti}`
- **ConfigService** — JWT_SECRET, JWT_EXPIRY, OTP_EXPIRY_SECONDS, OTP_RATE_LIMIT, MSG91_AUTH_KEY
- **normalizeIndianPhone()** — utility; accepts "9876543210", "919876543210", "+919876543210", "+91 98765 43210", "09876543210" → "+919876543210"
- **parseDuration()** — utility; parses "15m", "30d" to seconds

## Tokens and Redis keys

**Access token** (JWT):
- Payload: `{ sub: userId, phone }`
- Secret: JWT_SECRET
- Expiry: JWT_EXPIRY (default 15m)

**Refresh token** (JWT):
- Payload: `{ sub: userId, jti: string }`
- Secret: JWT_REFRESH_SECRET
- Expiry: JWT_REFRESH_EXPIRY (default 30d)

**Redis keys**:
- `otp:{phone}` — OTP code (TTL: OTP_EXPIRY_SECONDS, default 300s)
- `otp_rate:{phone}` — request count (TTL: 3600s, 1-hour window)
- `refresh:{userId}:{jti}` — marker (value `'1'`, TTL: 30 days)

## OTP providers

Interface: `OtpProvider` with `sendOtp(phone, otp): Promise<void>`.

- **DevOtpProvider** — logs OTP to console; used when MSG91_AUTH_KEY absent
- **Msg91OtpProvider** — placeholder (throws NotImplementedException)

To add a provider: implement `OtpProvider` interface, update factory in auth.module.ts.

## Guards and decorators

- **JwtAuthGuard** — exported by AuthModule; apply via `@UseGuards(JwtAuthGuard)` on controller methods
- **@Public()** — marks endpoint as public; checked by JwtAuthGuard before delegating to parent AuthGuard
- JwtAuthGuard is NOT global — each controller must explicitly opt-in

## Environment variables

| Variable | Example | Purpose |
|---|---|---|
| JWT_SECRET | `key123` | Access token secret |
| JWT_EXPIRY | `15m` | Access token TTL (ms notation) |
| JWT_REFRESH_SECRET | `rkey456` | Refresh token secret |
| JWT_REFRESH_EXPIRY | `30d` | Refresh token TTL (ms notation) |
| OTP_EXPIRY_SECONDS | `300` | OTP TTL in seconds |
| OTP_RATE_LIMIT | `5` | Max OTP requests per hour |
| MSG91_AUTH_KEY | (optional) | If set, uses Msg91OtpProvider; else DevOtpProvider |
| REDIS_URL | `redis://redis:6379` | Redis connection (throws on startup if missing) |

## Gotchas

- **Rate limit checked AFTER FixedOtp check**: Dev/QA accounts bypass rate limiting.
- **JwtAuthGuard is opt-in**: No global guard; controllers must import and apply it.
- **Phone normalization is strict**: Rejects numbers not matching 10 digits + prefix 6-9; throws BadRequestException.
- **Refresh token rotation**: Issuing a new refresh token invalidates the old one via jti deletion. Clients must store the new token.
