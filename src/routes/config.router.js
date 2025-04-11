import { Router } from "express";
import { latestVersion } from "../controllers/config.controller.js";

export const router = Router();

router.route("/latest-version").get(latestVersion);
