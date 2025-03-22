import express, { Router } from "express";

import {
  changePasswordController,
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

// export router
export default router;
