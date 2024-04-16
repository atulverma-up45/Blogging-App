import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.models.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken || req.headers["x-accesstoken"];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request. Please log in first.",
      });
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select(
      " _id personal_info.firstName personal_info.lastName personal_info.username personal_info.email accountType "
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const refreshToken =
        req.cookies.refreshToken || req.headers["x-refreshtoken"];

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Please Login Now, Refresh token is missing.",
        });
      }

      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedRefreshToken._id).select(
          "-password -refreshToken"
        );

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Please Login Now, Invalid Refresh Token",
          });
        }

        // Generate a new access token
        const newAccessToken = user.generateAccessToken();

        // Update the response with the new access token
        res.setHeader("X-accessToken", newAccessToken);
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: true,
        });

        // Continue with the request
        req.user = user;
        next();
      } catch (refreshError) {
        console.error("Refresh Token Error:", refreshError);
        return res.status(401).json({
          success: false,
          message:
            "Please Login Now, Your Authentication token is expired (refresh , and access token )",
        });
      }
    } else {
      console.error("Authentication Error:", error);
      return res.status(401).json({
        success: false,
        message: "Something went wrong while validating the Authentication",
      });
    }
  }
};

export const isUser = async (req, res, next) => {
  try {
    if (req.user.accountType !== "User") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized. This route is protected for User.",
      });
    }
    next();
  } catch (error) {
    console.error("Authorization Error:", error);
    return res.status(500).json({
      success: false,
      message: "User Account type is not verified due to some issues",
    });
  }
};
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized. This route is protected for Admin",
      });
    }
    next();
  } catch (error) {
    console.error("Authorization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin Account Type is not verified due to some issues",
    });
  }
};
