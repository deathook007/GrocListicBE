import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimiter } from "./src/middleware/rateLimiter.middleware.js";
//Routes
import { router as userRouter } from "./src/routes/user.routes.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

app.use(cookieParser());

app.use(rateLimiter);

app.use("/api/v1/users", userRouter); //https:localhost:3000/api/v1/users
