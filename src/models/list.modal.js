import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    coverImage: {
      type: String,
    },
    totalMembers: {
      type: Number,
      default: 1,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "User Id is required"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    items: [
      {
        name: {
          type: String,
          required: [true, "Item name is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity of item is required"],
        },
        unit: {
          type: String,
          default: "Kgs",
        },
        estimatedCost: {
          type: Number,
        },
        bought: {
          type: Boolean,
          default: false,
        },
        expiryDate: {
          type: String,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalNotBought: {
      type: Number,
      default: 0,
    },
    totalEstimatedCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const List = mongoose.model("List", listSchema);
