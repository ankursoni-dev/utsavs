export const OTP_PROVIDER = 'OTP_PROVIDER';

export interface OtpProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}
