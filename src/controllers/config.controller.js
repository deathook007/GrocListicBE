import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const latestVersion = asyncHandler(async (_, res) => {
  const latestVersion = "1.0.0";

  if (!latestVersion) {
    throw new ApiError(
      500,
      "Something went wrong while getting latest version"
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Latest version fetched successfully", {
      latestVersion,
    })
  );
});
