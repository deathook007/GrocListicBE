import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.modal.js";
import jwt from "jsonwebtoken";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "User not found!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json(new ApiResponse(401, "Unauthorized: Invalid token"));
  }
};
