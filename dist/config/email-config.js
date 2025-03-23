"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetLink = exports.sendVerificationOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendVerificationOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
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
    yield transporter.sendMail(mailOptions);
});
exports.sendVerificationOTP = sendVerificationOTP;
const sendPasswordResetLink = (email, resetURL) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
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
    yield transporter.sendMail(mailOptions);
});
exports.sendPasswordResetLink = sendPasswordResetLink;
