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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleController = exports.resetPasswordController = exports.verifyResetTokenController = exports.forgotPasswordController = exports.changePasswordController = exports.verifyOTPController = exports.userLoginController = exports.userRegistrationController = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var crypto_1 = require("crypto");
var User_1 = require("../models/User");
var async_handler_utils_1 = require("../utils/async-handler-utils");
var api_error_utils_1 = require("../utils/api-error-utils");
var otp_utils_1 = require("../utils/otp-utils");
var email_config_1 = require("../config/email-config");
var regex_1 = require("../constants/regex");
exports.userRegistrationController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, existingUser, salt, hashedPassword, otp, otpExpires, createdUser, idToken;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                return [4 /*yield*/, User_1.default.findOne({ $or: [{ email: email }, { username: username }] })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "User already exists"))];
                }
                if (!regex_1.passwordRegex.test(password)) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"))];
                }
                salt = bcryptjs_1.default.genSaltSync(10);
                hashedPassword = bcryptjs_1.default.hashSync(password, salt);
                otp = (0, otp_utils_1.generateOTP)();
                otpExpires = otp_utils_1.otpExpiresDate;
                return [4 /*yield*/, User_1.default.create({
                        email: email,
                        username: username,
                        password: hashedPassword,
                        otp: otp,
                        otpExpires: otpExpires,
                    })];
            case 2:
                createdUser = _b.sent();
                idToken = jsonwebtoken_1.default.sign({
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
                return [4 /*yield*/, (0, email_config_1.sendVerificationOTP)(email, otp)];
            case 3:
                _b.sent();
                res.status(201).json({
                    success: true,
                    idToken: idToken,
                    message: "OTP sent to your email. Please verify to activate your account.",
                });
                return [2 /*return*/];
        }
    });
}); });
exports.userLoginController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, user, isPasswordCorrect, idToken;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, User_1.default.findOne({
                        $or: [{ email: username }, { username: username }],
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next(new api_error_utils_1.default(401, "Invalid credentials"))];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
            case 2:
                isPasswordCorrect = _b.sent();
                if (!isPasswordCorrect) {
                    return [2 /*return*/, next(new api_error_utils_1.default(401, "Password is incorrect"))];
                }
                idToken = jsonwebtoken_1.default.sign({
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
                    idToken: idToken,
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
                return [2 /*return*/];
        }
    });
}); });
exports.verifyOTPController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var otp, userRes;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                otp = req.body.otp;
                if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isVerified) {
                    return [2 /*return*/, res
                            .status(200)
                            .json({ success: true, message: "Email already verified" })];
                }
                if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.otp) || req.user.otp !== otp) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "Invalid OTP"))];
                }
                if (new Date() > new Date(req.user.otpExpires)) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "OTP expired. Please request a new one"))];
                }
                return [4 /*yield*/, User_1.default.findByIdAndUpdate(req.user._id, {
                        isVerified: true,
                        otp: null,
                        otpExpires: null,
                    })];
            case 1:
                userRes = _c.sent();
                req.user = userRes;
                res
                    .status(200)
                    .json({ success: true, message: "Email verified successfully" });
                return [2 /*return*/];
        }
    });
}); });
exports.changePasswordController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, _a, oldPassword, newPassword, isPasswordCorrect, salt, hashedPassword, updatedUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, User_1.default.findById(req.user._id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next(new api_error_utils_1.default(404, "User not found"))];
                }
                _a = req.body, oldPassword = _a.oldPassword, newPassword = _a.newPassword;
                return [4 /*yield*/, bcryptjs_1.default.compare(oldPassword, user.password)];
            case 2:
                isPasswordCorrect = _b.sent();
                if (!isPasswordCorrect) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "Old password is incorrect"))];
                }
                if (!regex_1.passwordRegex.test(newPassword)) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"))];
                }
                salt = bcryptjs_1.default.genSaltSync(10);
                hashedPassword = bcryptjs_1.default.hashSync(newPassword, salt);
                return [4 /*yield*/, User_1.default.findByIdAndUpdate(req.user._id, {
                        password: hashedPassword,
                    })];
            case 3:
                updatedUser = _b.sent();
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
                return [2 /*return*/];
        }
    });
}); });
exports.forgotPasswordController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var username, user, resetToken, resetPasswordUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                return [4 /*yield*/, User_1.default.findOne({
                        $or: [{ email: username }, { username: username }],
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, next(new api_error_utils_1.default(404, "User not found."))];
                }
                resetToken = crypto_1.default.randomBytes(32).toString("hex");
                user.resetPasswordToken = resetToken;
                user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour Expiry
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                resetPasswordUrl = "".concat(process.env.CLIENT_URL, "/reset-password/").concat(resetToken);
                return [4 /*yield*/, (0, email_config_1.sendPasswordResetLink)(user.email, resetPasswordUrl)];
            case 3:
                _a.sent();
                res.status(200).json({
                    success: true,
                    message: "Reset password email sent successfully",
                });
                return [2 /*return*/];
        }
    });
}); });
exports.verifyResetTokenController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var resetToken, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resetToken = req.query.resetToken;
                return [4 /*yield*/, User_1.default.findOne({
                        resetPasswordToken: resetToken,
                        resetPasswordExpires: { $gt: new Date() },
                    })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid or expired token" })];
                res.status(200).json({ success: true, message: "Token is valid" });
                return [2 /*return*/];
        }
    });
}); });
exports.resetPasswordController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, resetToken, newPassword, user, salt, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, resetToken = _a.resetToken, newPassword = _a.newPassword;
                return [4 /*yield*/, User_1.default.findOne({
                        resetPasswordToken: resetToken,
                        resetPasswordExpires: { $gt: new Date() },
                    })];
            case 1:
                user = _c.sent();
                if (!user)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid or expired token" })];
                if (!regex_1.passwordRegex.test(newPassword)) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"))];
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 2:
                salt = _c.sent();
                _b = user;
                return [4 /*yield*/, bcryptjs_1.default.hash(newPassword, salt)];
            case 3:
                _b.password = _c.sent();
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                return [4 /*yield*/, user.save()];
            case 4:
                _c.sent();
                res.status(200).json({
                    success: true,
                    message: "Password reset successfully",
                });
                return [2 /*return*/];
        }
    });
}); });
exports.updateUserRoleController = (0, async_handler_utils_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, role, username, user, validRoles, updatedUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, role = _a.role, username = _a.username;
                return [4 /*yield*/, User_1.default.findOne({
                        $or: [{ email: username }, { username: username }],
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, next(new api_error_utils_1.default(404, "User not found"))];
                }
                validRoles = ["admin", "user"];
                if (!validRoles.includes(role)) {
                    return [2 /*return*/, next(new api_error_utils_1.default(400, "Invalid role"))];
                }
                return [4 /*yield*/, User_1.default.findByIdAndUpdate(user._id, {
                        role: role,
                    }, { new: true })];
            case 2:
                updatedUser = _b.sent();
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
                return [2 /*return*/];
        }
    });
}); });
