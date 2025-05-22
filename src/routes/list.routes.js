import { Router } from "express";
import { createList } from "../controllers/list.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { upload } from "../middleware/multer.middleware.js";

export const router = Router();

router.route("/create-list").post(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  requireAuth,
  createList
);
