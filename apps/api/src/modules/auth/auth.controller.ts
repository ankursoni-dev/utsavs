import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthTokenResponseDto,
  OtpRequestResponseDto,
  TokenRefreshResponseDto,
} from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from './guards/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp-request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request an OTP to the given phone number' })
  @ApiResponse({ status: 200, type: OtpRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  @ApiResponse({ status: 429, description: 'Too many OTP requests' })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpRequestResponseDto> {
    return this.authService.requestOtp(dto.phone);
  }

  @Post('otp-verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive JWT tokens' })
  @ApiResponse({ status: 200, type: AuthTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid phone number format' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenResponseDto> {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('token-refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and receive a new token pair' })
  @ApiResponse({ status: 200, type: TokenRefreshResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or revoked refresh token' })
  async refreshTokens(@Body() dto: RefreshTokenDto): Promise<TokenRefreshResponseDto> {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}
