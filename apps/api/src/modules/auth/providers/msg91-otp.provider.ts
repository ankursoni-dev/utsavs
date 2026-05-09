import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpProvider } from './otp-provider.interface';

@Injectable()
export class Msg91OtpProvider implements OtpProvider {
  constructor(private readonly configService: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendOtp(_phone: string, _otp: string): Promise<void> {
    const _authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    throw new NotImplementedException(
      'MSG91 provider not yet implemented. Configure MSG91_AUTH_KEY and implement the HTTP call.',
    );
  }
}
