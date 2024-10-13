import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

export const router = Router();

router.route("/register").post(registerUser); //https:localhost:3000/api/v1/users/register
