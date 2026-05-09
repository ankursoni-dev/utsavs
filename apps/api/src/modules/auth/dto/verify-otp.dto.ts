import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '9876543210', description: 'Indian mobile number' })
  phone: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({ example: '123456' })
  otp: string;
}
