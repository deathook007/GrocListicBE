import { Router } from "express";
import { createList } from "../controllers/list.controller.js";
import { upload } from "../middleware/multer.middleware.js";

export const router = Router();

router.route("/create-list").post(
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  createList
);
