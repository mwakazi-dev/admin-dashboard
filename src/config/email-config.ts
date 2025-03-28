import nodemailer from "nodemailer";

export const sendVerificationOTP = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail email
      pass: process.env.EMAIL_PASSWORD, // App password or Gmail password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your verification code",
    html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetLink = async (
  email: string,
  resetURL: string
) => {
  const transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail email
      pass: process.env.EMAIL_PASSWORD, // App password or Gmail password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetURL}">here</a> to reset your password.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
