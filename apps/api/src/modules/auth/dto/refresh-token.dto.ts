import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'JWT refresh token from otp-verify or previous token-refresh',
  })
  refreshToken: string;
}
