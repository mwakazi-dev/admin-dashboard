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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const api_error_utils_1 = __importDefault(require("../utils/api-error-utils"));
const async_handler_utils_1 = __importDefault(require("../utils/async-handler-utils"));
const authMiddleware = (0, async_handler_utils_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return next(new api_error_utils_1.default(401, "Unauthorized. Please login."));
    }
    // verify token
    const decodedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decodedUser) {
        return next(new api_error_utils_1.default(403, "Invalid token. Please login again."));
    }
    req.user = decodedUser;
    next();
}));
exports.default = authMiddleware;
