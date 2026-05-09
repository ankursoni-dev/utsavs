import { ApiProperty } from '@nestjs/swagger';

export class OtpRequestResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  expiresIn: number;
}

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ nullable: true })
  name: string | null;
}

export class AuthTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: () => AuthUserDto })
  user: AuthUserDto;
}

export class TokenRefreshResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
