export interface IUser {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp: string | null | undefined;
  otpExpires: Date | null | undefined;
}
