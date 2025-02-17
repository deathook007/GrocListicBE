import {
  forgotPassword,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
} from "../controllers/user.controller.js";

import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";

export const router = Router();

//https:localhost:3000/api/v1/users/register
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

//Secured Routes (User should be logged in)
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/user-details").post(getUserDetails);
