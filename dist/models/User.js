"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// create user schema with username, email and password
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "Please enter your username"],
        unique: true,
        trim: true,
        minLength: [3, "Username must be at least 4 characters long"],
        validate: {
            validator: function (value) {
                const regex = /^[a-zA-Z0-9]+$/;
                return regex.test(value);
            },
            message: "Username can only contain alphanumeric characters",
        },
    },
    email: {
        type: String,
        required: [true, "Please enter your email address"],
        unique: true,
        trim: true,
        validate: {
            validator: function (value) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(value);
            },
            message: "Invalid email address",
        },
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userSchema);
