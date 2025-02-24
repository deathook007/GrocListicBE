import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { List } from "../models/list.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/uploadFileOnCloudinary.js";

export const createList = asyncHandler(async (req, res) => {
  const { userId, name } = req.body;

  if ([userId, name].some((field) => field?.trim === "")) {
    throw new ApiError(400, "userId and list name is required");
  }

  const existingList = await List.findOne({ name });

  if (existingList) {
    throw new ApiError(
      409,
      "List already exists with same name! Try a different name"
    );
  }

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

  console.log("User Id, name", userId, name);

  const newList = await List.create({
    userId,
    name,
    coverImage: coverImage?.url || "",
    totalMember: 1,
    members: [
      {
        userId,
      },
    ],
    items: [],
    totalItems: 0,
    totalNotBought: 0,
    totalEstimatedCost: 0,
  });

  const createdList = await List.findById(newList._id);

  if (!createdList) {
    throw new ApiError(500, "Something went wrong while creating list");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "List created successfully", createdList));
});
