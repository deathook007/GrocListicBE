import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

export const connectMongoDB = async () => {
  try {
    const mongoDBListener = mongoose.connection;

    mongoDBListener.on("connected", () => {
      console.log("Mongo DB Connected!");
    });

    mongoDBListener.on("disconnecting", () => {
      console.log("Mongo DB disconnecting!");
    });

    mongoDBListener.on("disconnected", () => {
      console.log("Mongo DB disconnected!");
    });

    mongoDBListener.on("reconnecting", () => {
      console.log("Mongo DB reconnecting!");
    });

    mongoDBListener.on("reconnected", () => {
      console.log("Mongo DB reconnected!");
    });

    await mongoose.connect(MONGODB_URL);
  } catch (error) {
    console.log("Mongo DB connection error from catch block", error);
  }
};
