import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  updateItem,
} from "../controllers/toBuyItem.controller.js";

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

export const router = Router();

router.get("/get-all-items", requireAuth, getAllItems);
router.get("/get-item/:id", requireAuth, getItemById);
router.post("/create-item", requireAuth, createItem);
router.put("/update-item/:id", requireAuth, updateItem);
router.delete("/delete-item/:id", requireAuth, deleteItem);
