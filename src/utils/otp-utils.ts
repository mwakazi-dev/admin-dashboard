export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// otp expires in 10 minutes
export const otpExpiresDate = new Date(Date.now() + 10 * 60 * 1000);
