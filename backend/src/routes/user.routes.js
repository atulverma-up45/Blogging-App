import {
   sigUpController,
  loginController,
  changePasswordController,
  userDetailsController,
  logoutUserContoller,
} from "../controllers/user.controller.js";

import {authenticate, isUser, isAdmin} from "../middlewares/auth.middlewares.js"

import express from "express";

const userRoutes = express.Router();

// define the routes

userRoutes.route("/signup").post(sigUpController);
userRoutes.route("/signin").post(loginController);
userRoutes.route("/change-password").post(authenticate,changePasswordController);
userRoutes.route("/user-profile").get(authenticate,userDetailsController)
userRoutes.route("/logout").post(authenticate,logoutUserContoller)

export default userRoutes;
