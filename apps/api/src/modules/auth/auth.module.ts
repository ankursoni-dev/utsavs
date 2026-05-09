import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DevOtpProvider } from './providers/dev-otp.provider';
import { Msg91OtpProvider } from './providers/msg91-otp.provider';
import { OTP_PROVIDER } from './providers/otp-provider.interface';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // Cast to 'any' to bypass StringValue branded type — the runtime value is valid ms notation.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRY', '15m') as any },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    DevOtpProvider,
    Msg91OtpProvider,
    {
      provide: OTP_PROVIDER,
      inject: [ConfigService, DevOtpProvider, Msg91OtpProvider],
      useFactory: (
        configService: ConfigService,
        dev: DevOtpProvider,
        msg91: Msg91OtpProvider,
      ): DevOtpProvider | Msg91OtpProvider =>
        configService.get<string>('MSG91_AUTH_KEY') ? msg91 : dev,
    },
  ],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
