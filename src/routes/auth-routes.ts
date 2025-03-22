import express, { Router } from "express";

import {
  changePasswordController,
  resetPasswordController,
  userLoginController,
  userRegistrationController,
  verifyOTPController,
} from "../controllers/auth-controller";
import authMiddleware from "../middlewares/auth-middleware";

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

// reset password
router.post("/reset-password", resetPasswordController);

// export router
export default router;
