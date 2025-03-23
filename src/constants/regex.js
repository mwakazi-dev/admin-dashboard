"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordRegex = void 0;
exports.passwordRegex = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/);
