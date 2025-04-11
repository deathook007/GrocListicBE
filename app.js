import { router as configRouter } from "./src/routes/config.router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { router as listRouter } from "./src/routes/list.routes.js";
import { rateLimiter } from "./src/middleware/rateLimiter.middleware.js";
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
app.use("/api/v1/lists", listRouter); //https:localhost:3000/api/v1/lists
app.use("/api/v1/configs", configRouter); //https:localhost:3000/api/v1/config
