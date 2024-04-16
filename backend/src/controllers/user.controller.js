import User from "../models/user.models.js";
import signUpUserTemplate from "../mail/Templates/signUpUser.templates.js";
import changePasswordTemplate from "../mail/Templates/changePassword.mailTemplates.js";
import otpGenerator from "otp-generator";
import sendMail from "../utils/sendMail.js";
import { nanoid } from "nanoid";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// email validation function
function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// generate Access And Refresh Tokens
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error Generating Tokens:", error);
    throw new Error("Error generating tokens");
  }
};

// signup Controller
export const sigUpController = async (req, res) => {
  try {
    // Fetch the data from req body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
    } = req.body;

    // Validate the data
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    // Validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please Enter a Valid Email",
      });
    }

    // Validate the password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and ConfirmPassword Should be Same.",
      });
    }

    // Check if the user is already registered
    const alreadyRegisteredUser = await User.findOne({
      "personal_info.email": email,
    });

    if (alreadyRegisteredUser) {
      return res.status(400).json({
        success: false,
        message: "User with this Email is Already Registered",
      });
    }

    const generateUsername = async (email) => {
      let username = email.split("@")[0];
      username = username.replace(/[^a-zA-Z0-9]/g, "");
      let isUsernameNotUnique = await User.exists({
        "personal_info.username": username,
      }).then((result) => {
        return result;
      });

      return isUsernameNotUnique
        ? (username += nanoid().substring(0, 5))
        : username;
    };

    // Create the user
    const createdUser = await User.create({
      personal_info: {
        firstName,
        lastName,
        email,
        password: confirmPassword,
        contactNumber,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        username: await generateUsername(email),
      },
    });

    // Send Successful Registration email to the user
    try {
      await sendMail(
        email,
        "Welcome to Developer Atul Verma Blog - Successful Registration",
        signUpUserTemplate(firstName, email, confirmPassword)
      );
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Generate the accessToken and Refresh Token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      createdUser._id
    );

    // Get the logged-in user without sensitive information
    const loggedInUser = await User.findById(createdUser._id).select(
      "-personal_info.password -refreshToken -social_links -google_auth -accountType -joinedAt -updatedAt -account_info -blogs -__v -personal_info.contactNumber -_id "
    );

    // Set the JWT as a cookie and create options
    const options = {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    };

    // Include the access token and Refresh token in the response headers
    res.setHeader("X-accessToken", accessToken);
    res.setHeader("X-refreshToken", refreshToken);

    // Return response
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "The user was successfully registered.",
        accessToken: accessToken,
        user: loggedInUser.personal_info,
      });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// login controller
export const loginController = async (req, res) => {
  try {
    //fetch the data from req body
    const { email, password } = req.body;

    // validate the data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password is Required for login",
      });
    }

    // validate the email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please Enter a Valid Email ID",
      });
    }

    // check user is Registered or not
    const user = await User.findOne({
      "personal_info.email": email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "The user with this Email is Not Registered Please SignUp first",
      });
    }

    // Compare and match the password
    const isCorrectPassword = await user.isPasswordCorrect(password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect. Please enter the correct password",
      });
    }

    // generate the accessToken and Refresh Token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    // Get the logged-in user without sensitive information
    const loggedInUser = await User.findById(user._id).select(
      "-personal_info.password -refreshToken -social_links -google_auth -accountType -joinedAt -updatedAt -account_info -blogs -__v -personal_info.contactNumber -_id "
    );

    // // Get the logged-in user without sensitive information
    // const loggedInUser = await User.findById(user._id).select(
    //   "-password -refreshToken"
    // );

    // Set the JWT as a cookie and create options
    const options = {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    };

    // include the access token And Refresh token in the response headers
    res.setHeader("X-accessToken", accessToken);
    res.setHeader("X-refreshToken", refreshToken);

    // Send the response with cookies and user information
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User logged in successfully",
        accessToken: accessToken,
        user: loggedInUser.personal_info,
      });
  } catch (error) {
    console.log("Error Occurred While Login", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// change password controller
export const changePasswordController = async (req, res) => {
  try {
    // fetch the old password and new password and confirm password from req body
    const { currentPassword, newPassword } = req.body;

    // fetch email from req
    const email = req.user.personal_info.email;

    // validate the data
    if (!currentPassword.length || !newPassword.length) {
      return res.status(400).json({
        success: false,
        message: "All fields are Required",
      });
    }

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
      });
    }

    // find the user with email
    const user = await User.findOne({
      "personal_info.email": email,
    });

    // check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check old password is correct or not
    const isCorrectPassword = await user.isPasswordCorrect(currentPassword);

    if (!isCorrectPassword) {
      return res.status(401).json({
        success: false,
        message:
          "Current Password is incorrect. Please enter the valid Current password",
      });
    }

    // Update the password in the user instance (not saved to the database yet)
    user.personal_info.password = newPassword;

    // Save the updated user to the database
    await user.save();

    // Send Change Password Mail via email
    await sendMail(
      user.personal_info.email,
      "Your Password Changed Successfully Mail From Developer Atul Verma",
      changePasswordTemplate(user.personal_info.firstName, newPassword)
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.log("Error Occurred While Changing the Password", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get user details controller
export const userDetailsController = async (req, res) => {
  try {
    // fetch the user id
    const userId = req.user._id;

    console.log(userId);

    // validate the user id
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id is Required",
      });
    }

    // find the user details form database
    const userDetails = await User.findById(userId).select(
      "-personal_info.password -refreshToken -accountType"
    );

    // validate the user details
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Please Enter a Valid User ID",
      });
    }

    //return the user details
    return res.status(200).json({
      success: true,
      message: "User Profile Details Fetched Successfully",
      user: userDetails,
    });
  } catch (error) {
    console.log("Error Occured While Fetching the Profile Details", error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error The User Profile Cannot Fetched Please Try again Later",
      error: error.message,
    });
  }
};

// logout the user
export const logoutUserContoller = async (req, res) => {
  try {
    // Update user to clear tokens
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
          accessToken: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      // Handle the case where the user was not found
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully.",
      });
  } catch (error) {
    console.error("Error in logoutUserContoller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// update profile image with img url
export const updateProfileImageController = async (req, res) => {
  try {
    // destructure the data from req
    const avatar = req.file?.path;
    const user_id = req.user._id;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar is required.",
      });
    }

    const response = await uploadOnCloudinary(avatar);

    const url = response.secure_url;

    const profile = await User.findOneAndUpdate(
      { _id: user_id },
      { "personal_info.avatar": url }
    );

    return res.status(200).json({
      success: true,
      message: "Profile image Updated Successfully",
      avatar: url,
    });
  } catch (error) {
    console.log(
      "Error occured while updating the profile image : updateProfileImageController",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfileController = async (req, res) => {
  // destructure the data from the request
  const { username, bio, social_links } = req.body;
  const user_id = req.user._id;

  const bioLimit = 150;

  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username should be at least 3 letters long",
    });
  }

  if (bio.length > bioLimit) {
    return res.status(400).json({
      success: false,
      message: `Bio should not be more than ${bioLimit} characters`,
    });
  }

  try {
    for (const [key, value] of Object.entries(social_links)) {
      if (value.length > 0) {
        const hostname = new URL(value).hostname;
        const domain = `${key}.com`;
        if (!hostname.includes(domain) && key !== "website") {
          return res.status(400).json({
            success: false,
            message: `${key} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Invalid social links. Please provide full links with 'https' included",
    });
  }

  const updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  try {
    await User.findOneAndUpdate({ _id: user_id }, updateObj, { runValidators: true });
    return res.status(200).json({
      success: true,
      message: "User Profile Updated Successfully",
      username,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username is already taken",
        success: false,
      });
    }
    console.error("Error Occurred in Update Profile Controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

