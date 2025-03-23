"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpExpiresDate = exports.generateOTP = void 0;
var generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
// otp expires in 10 minutes
exports.otpExpiresDate = new Date(Date.now() + 10 * 60 * 1000);
