"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var jsonwebtoken_1 = require("jsonwebtoken");
var api_error_utils_1 = require("../utils/api-error-utils");
var errorHandler = function (err, req, res, next) {
    var statusCode = err.statusCode || 500;
    var message = err.message || "Internal Server Error";
    // ✅ Handle Mongoose Validation Errors
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(function (val) { return val.message; })
            .join(", ");
    }
    // ✅ Handle MongoDB Duplicate Key Errors
    if (err.code === 11000) {
        statusCode = 400;
        message = "The ".concat(Object.keys(err.keyValue)[0], " already exists.");
    }
    // ✅ Handle JWT Errors
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        statusCode = 401;
        message = "Token has expired. Please log in again.";
    }
    else if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid token. Please authenticate again.";
    }
    // ✅ Handle Bcrypt Errors
    if (err.message && err.message.includes("bcrypt")) {
        statusCode = 500;
        message = "Internal server error during password encryption.";
    }
    // ✅ Handle Custom API Errors
    if (err instanceof api_error_utils_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // ✅ Log errors in development mode
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", err);
    }
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.default = errorHandler;
