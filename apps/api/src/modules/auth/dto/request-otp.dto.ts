import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '9876543210',
    description: 'Indian mobile number (10 digits, with or without +91 prefix)',
  })
  phone: string;
}
