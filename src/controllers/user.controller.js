import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../helpers/mailer.js";
import { uploadFileOnCloudinary } from "../utils/uploadFileOnCloudinary.js";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    const { exp: refreshTokenExpiry } = await jwt.decode(refreshToken);

    // Convert the `refreshTokenExpiry` (which is in seconds) to a JavaScript Date object
    const refreshTokenExpiryDate = new Date(refreshTokenExpiry * 1000);

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiryDate;

    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (
    [username, fullName, email, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  // TODO: Validation - In Separate file and use here

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists with same username or email");
  }

  let avatarLocalPath;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadFileOnCloudinary(avatarLocalPath);

  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  const newUser = await User.create({
    username: username.toLowerCase(),
    fullName,
    email: email.toLowerCase(),
    password,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select("-password ");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  await sendEmail({
    email: email,
    emailType: "VERIFY",
    userId: newUser._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Please enter a valid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const updatedUser = await User.findById(user._id).select();
  const verifyToken = updatedUser.verifyToken;

  const loggedInUser = await User.findById(user._id).select(
    "-password -verifyToken -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("verifyToken", verifyToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        verifyToken: verifyToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthenticated request");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user?.refreshTokenExpiry < new Date()) {
      throw new ApiError(401, "Expired refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    return res
      .status(401)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(401, "Session expired. Please log in again.", {}));
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(
      404,
      "User not found. Please sign up to create an account"
    );
  }

  try {
    await sendEmail({
      email: email,
      emailType: "RESET",
      userId: user._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Password reset email has been sent successfully. Please check your inbox for further instructions.",
          {}
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Something went wrong while resetting your password",
          {}
        )
      );
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { forgotPasswordToken, newPassword, confirmNewPassword } = req.body;

  if (!forgotPasswordToken) {
    throw new ApiError(400, "Reset token is required");
  }

  if (!newPassword || !confirmNewPassword) {
    throw new ApiError(400, "New password and confirm password are required");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findOne({
    forgotPasswordToken: forgotPasswordToken,
    forgotPasswordTokenExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError(
      404,
      "Invalid or expired reset token. Please request a new password reset link."
    );
  }

  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password cannot be the same as the old password"
    );
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password has been reset successfully", {}));
});
