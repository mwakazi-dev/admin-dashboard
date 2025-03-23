export interface IUser {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role?: string;
}
