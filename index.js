import {} from "dotenv/config";

import { app } from "./app.js";
import { connectMongoDB } from "./src/database/mongo.database.js";

const PORT = process.env.PORT || 8000;

connectMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
    console.log("MongoDB connected successfully :)");
  })
  .catch((error) => {
    console.log("Mongo DB connection error from index.js", error);
  });
