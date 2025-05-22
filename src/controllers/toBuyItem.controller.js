import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ToBuyItem } from "../models/toBuyItem.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllItems = asyncHandler(async (req, res) => {
  const items = await ToBuyItem.find().sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "All items fetched successfully", items));
});

export const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError(400, "Item id is required");
  }

  const existingItem = await ToBuyItem.findOne({ id });

  if (!existingItem) {
    throw new ApiError(404, "Item with this ID not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Item fetched successfully", existingItem));
});

export const createItem = asyncHandler(async (req, res) => {
  const { id, name, quantity, unit, category } = req.body;

  if ([id, name, quantity].some((field) => field?.trim === "")) {
    throw new ApiError(400, "id, name and quantity field are required");
  }

  const existingItem = await ToBuyItem.findOne({ id });

  if (existingItem) {
    throw new ApiError(409, "Item with this ID already exists");
  }

  const newItem = await ToBuyItem.create({
    id,
    name,
    quantity,
    unit,
    category,
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Item created successfully", newItem));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id, name, quantity, unit, category } = req.body;

  if (!id) {
    throw new ApiError(400, "Item id is required");
  }

  const existingItem = await ToBuyItem.findOne({ id });

  if (!existingItem) {
    throw new ApiError(404, "Item not found");
  }

  existingItem.name = name || existingItem.name;
  existingItem.quantity = quantity || existingItem.quantity;
  existingItem.unit = unit || existingItem.unit;
  existingItem.category = category || existingItem.category;

  const updatedItem = await existingItem.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Item updated successfully", updatedItem));
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError(400, "Item id is required");
  }

  const deletedItem = await ToBuyItem.findOneAndDelete({ id });

  if (!deletedItem) {
    throw new ApiError(404, "Item not found or already deleted");
  }

  res.status(200).json(new ApiResponse(200, "Item deleted successfully"));
});
