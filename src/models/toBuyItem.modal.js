import mongoose from "mongoose";

const toBuyItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      enum: ["gm", "kg", "ml", "ltr", "pc", "pkt"],
      required: true,
    },
    category: {
      type: String,
      default: "Grocery",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ToBuyItem = mongoose.model("ToBuyItem", toBuyItemSchema);
