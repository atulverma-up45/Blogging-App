import {
  sigUpController,
  loginController,
  changePasswordController,
  userDetailsController,
  logoutUserContoller,
  updateProfileImageController,
  updateProfileController,
} from "../controllers/user.controller.js";

import {
  authenticate,
  isUser,
  isAdmin,
} from "../middlewares/auth.middlewares.js";

import express from "express";
import { upload } from "../middlewares/multer.middlewares.js";

const userRoutes = express.Router();

// define the routes

userRoutes.route("/signup").post(sigUpController);
userRoutes.route("/signin").post(loginController);
userRoutes
  .route("/change-password")
  .post(authenticate, changePasswordController);
userRoutes.route("/user-profile").get(authenticate, userDetailsController);
userRoutes.route("/logout").post(authenticate, logoutUserContoller);
userRoutes
  .route("/update-profile-img")
  .post(authenticate, upload.single("avatar"), updateProfileImageController);

userRoutes.route("/update-profile").post(authenticate, updateProfileController);

export default userRoutes;
