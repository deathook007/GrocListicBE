import {} from "dotenv/config";

import express from "express";
import mongoose from "mongoose";

import { connectMongoDB } from "./src/database/mongo.database.js";

import "./src/models/user.modal.js";

const app = express();

connectMongoDB();

const Users = mongoose.model("User");

app.get("/", (_, res) => {
  res.send("Success!");
});

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  const isOldUser = Users.findOne({
    email: email,
  });

  if (isOldUser) {
    return res.send({
      data: "User already registered!",
    });
  }

  try {
    await Users.create({
      username: username,
      email: email,
      password: password,
    });
    res.send({
      status: 200,
      data: "New user created!",
    });
  } catch (error) {
    res.send({
      data: error,
    });
  }
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening Server on http://localhost:${port}`);
});
