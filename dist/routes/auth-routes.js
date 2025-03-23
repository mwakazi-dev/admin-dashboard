"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth-controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth-middleware"));
const admin_middleware_1 = __importDefault(require("../middlewares/admin-middleware"));
// initialize express Router
const router = express_1.default.Router();
// create registration route
router.post("/register", auth_controller_1.userRegistrationController);
// create login route
router.post("/login", auth_controller_1.userLoginController);
// otp verification
router.post("/verify-otp", auth_middleware_1.default, auth_controller_1.verifyOTPController);
// change password
router.post("/change-password", auth_middleware_1.default, auth_controller_1.changePasswordController);
// forgot password
router.post("/forgot-password", auth_controller_1.forgotPasswordController);
// verify reset password token
router.get("/verify-reset-token", auth_controller_1.verifyResetTokenController);
// reset password
router.post("/reset-password", auth_controller_1.resetPasswordController);
// update user role
router.patch("/update-role", auth_middleware_1.default, admin_middleware_1.default, auth_controller_1.updateUserRoleController);
// export router
exports.default = router;
