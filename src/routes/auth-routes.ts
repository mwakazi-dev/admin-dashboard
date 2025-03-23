import express, { Router } from "express";

import {
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
  updateUserRoleController,
  userLoginController,
  userRegistrationController,
  verifyOTPController,
  verifyResetTokenController,
} from "../controllers/auth-controller";
import authMiddleware from "../middlewares/auth-middleware";
import adminMiddleware from "../middlewares/admin-middleware";

// initialize express Router
const router: Router = express.Router();

// create registration route
router.post("/register", userRegistrationController);

// create login route
router.post("/login", userLoginController);

// otp verification
router.post("/verify-otp", authMiddleware, verifyOTPController);

// change password
router.post("/change-password", authMiddleware, changePasswordController);

// forgot password
router.post("/forgot-password", forgotPasswordController);

// verify reset password token
router.get("/verify-reset-token", verifyResetTokenController);

// reset password
router.post("/reset-password", resetPasswordController);

// update user role
router.patch(
  "/update-role",
  authMiddleware,
  adminMiddleware,
  updateUserRoleController
);

// export router
export default router;
