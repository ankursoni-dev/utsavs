import { Injectable } from '@nestjs/common';
import { OtpProvider } from './otp-provider.interface';

@Injectable()
export class DevOtpProvider implements OtpProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    console.log(`\n📱 [DEV OTP] ${phone}: ${otp}\n`);
  }
}
