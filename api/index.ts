// import app from "../app";

// export default app;

import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../app";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: ".env" });

process.on("uncaughtException", (err) => {
  console.error("UNHANDLED EXCEPTION ---- Shutting down 💥");
  console.error(err.name, err.stack, err.message);
  process.exit(1);
});

const db =
  "mongodb+srv://mosesmwangime:4Owf3JAY8YpVbT0y@fooddelivercluster.q3ihtsr.mongodb.net/delivery?retryWrites=true&w=majority&appName=FoodDeliverCluster";
mongoose
  .connect(db)
  .then(() => {
    console.log("Database has succefully connneccted");
  })
  .catch((err: Error) => console.error(err, "moess"));

const port: number = Number(process.env.PORT) || 3005;
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`listening to port ${port}`);
});
