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
exports.updateUserRoleController = exports.resetPasswordController = exports.verifyResetTokenController = exports.forgotPasswordController = exports.changePasswordController = exports.verifyOTPController = exports.userLoginController = exports.userRegistrationController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const async_handler_utils_1 = __importDefault(require("../utils/async-handler-utils"));
const api_error_utils_1 = __importDefault(require("../utils/api-error-utils"));
const otp_utils_1 = require("../utils/otp-utils");
const email_config_1 = require("../config/email-config");
const regex_1 = require("../constants/regex");
exports.userRegistrationController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    // check if user is already registered
    const existingUser = yield User_1.default.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return next(new api_error_utils_1.default(400, "User already exists"));
    }
    if (!regex_1.passwordRegex.test(password)) {
        return next(new api_error_utils_1.default(400, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"));
    }
    // hash the passwword
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = bcryptjs_1.default.hashSync(password, salt);
    // generate otp
    const otp = (0, otp_utils_1.generateOTP)();
    const otpExpires = otp_utils_1.otpExpiresDate;
    // save user
    const createdUser = yield User_1.default.create({
        email,
        username,
        password: hashedPassword,
        otp,
        otpExpires,
    });
    // generate jwt
    let idToken = jsonwebtoken_1.default.sign({
        _id: createdUser._id,
        email: createdUser.email,
        username: createdUser.username,
        isVerified: createdUser.isVerified,
        otp: createdUser.otp,
        otpExpires: createdUser.otpExpires,
        role: createdUser.role,
    }, process.env.JWT_SECRET, {
        expiresIn: "1hr",
    });
    yield (0, email_config_1.sendVerificationOTP)(email, otp);
    res.status(201).json({
        success: true,
        idToken,
        message: "OTP sent to your email. Please verify to activate your account.",
    });
}));
exports.userLoginController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // check if the user exists
    const user = yield User_1.default.findOne({
        $or: [{ email: username }, { username: username }],
    });
    if (!user) {
        return next(new api_error_utils_1.default(401, "Invalid credentials"));
    }
    // check if the password is correct
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordCorrect) {
        return next(new api_error_utils_1.default(401, "Password is incorrect"));
    }
    // generate jwt
    let idToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        role: user.role,
    }, process.env.JWT_SECRET, {
        expiresIn: "1hr",
    });
    // send jwt as response
    res.status(200).json({
        success: true,
        idToken,
        expiresIn: "1hr",
        message: "Login successful",
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            role: user.role,
        },
    });
}));
exports.verifyOTPController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { otp } = req.body;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified) {
        return res
            .status(200)
            .json({ success: true, message: "Email already verified" });
    }
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.otp) || req.user.otp !== otp) {
        return next(new api_error_utils_1.default(400, "Invalid OTP"));
    }
    if (new Date() > new Date(req.user.otpExpires)) {
        return next(new api_error_utils_1.default(400, "OTP expired. Please request a new one"));
    }
    const userRes = yield User_1.default.findByIdAndUpdate(req.user._id, {
        isVerified: true,
        otp: null,
        otpExpires: null,
    });
    req.user = userRes;
    res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
}));
exports.changePasswordController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user exists
    const user = yield User_1.default.findById(req.user._id);
    if (!user) {
        return next(new api_error_utils_1.default(404, "User not found"));
    }
    const { oldPassword, newPassword } = req.body;
    const isPasswordCorrect = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
        return next(new api_error_utils_1.default(400, "Old password is incorrect"));
    }
    if (!regex_1.passwordRegex.test(newPassword)) {
        return next(new api_error_utils_1.default(400, "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"));
    }
    // hash the new password
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hashedPassword = bcryptjs_1.default.hashSync(newPassword, salt);
    // update the password
    const updatedUser = yield User_1.default.findByIdAndUpdate(req.user._id, {
        password: hashedPassword,
    });
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
        data: {
            _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
            username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
            email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
            isVerified: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isVerified,
            role: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.role,
        },
    });
}));
exports.forgotPasswordController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    // check if the user exists
    const user = yield User_1.default.findOne({
        $or: [{ email: username }, { username }],
    });
    if (!user) {
        return next(new api_error_utils_1.default(404, "User not found."));
    }
    // generate reset token
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour Expiry
    yield user.save();
    // send reset password email
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    yield (0, email_config_1.sendPasswordResetLink)(user.email, resetPasswordUrl);
    res.status(200).json({
        success: true,
        message: "Reset password email sent successfully",
    });
}));
exports.verifyResetTokenController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken } = req.query;
    const user = yield User_1.default.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
        return res.status(400).json({ message: "Invalid or expired token" });
    res.status(200).json({ success: true, message: "Token is valid" });
}));
exports.resetPasswordController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken, newPassword } = req.body;
    const user = yield User_1.default.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
        return res.status(400).json({ message: "Invalid or expired token" });
    if (!regex_1.passwordRegex.test(newPassword)) {
        return next(new api_error_utils_1.default(400, "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"));
    }
    // Hash new password
    const salt = yield bcryptjs_1.default.genSalt(10);
    user.password = yield bcryptjs_1.default.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    yield user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
}));
exports.updateUserRoleController = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // destructure role and userId from req.body
    const { role, username } = req.body;
    // check if the user exists
    const user = yield User_1.default.findOne({
        $or: [{ email: username }, { username }],
    });
    if (!user) {
        return next(new api_error_utils_1.default(404, "User not found"));
    }
    // check if the provided role is valid
    const validRoles = ["admin", "user"];
    if (!validRoles.includes(role)) {
        return next(new api_error_utils_1.default(400, "Invalid role"));
    }
    // update user role
    const updatedUser = yield User_1.default.findByIdAndUpdate(user._id, {
        role,
    }, { new: true });
    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: {
            _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
            username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
            email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
            isVerified: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isVerified,
            role: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.role,
        },
    });
}));
