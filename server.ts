import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const app = require("./app");

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: ".env" });

process.on("uncaughtException", (err) => {
  console.error("UNHANDLED EXCEPTION ---- Shutting down 💥");
  console.error(err.name, err.stack, err.message);
  process.exit(1);
});

// const db =
//   "mongodb+srv://mosesmwangime:4mn2TqRhReEkVL0T@deliverycluster0.i6awu9f.mongodb.net/deliverFood?retryWrites=true&w=majority&appName=DeliveryCluster0";

// const db =
//   "mongodb+srv://mosesmwangime:4Owf3JAY8YpVbT0y@fooddelivercluster.q3ihtsr.mongodb.net/delivery?retryWrites=true&w=majority&appName=FoodDeliverCluster";

const db =
  "mongodb+srv://mosesmwangime:9SPqAj4JOaXBxDrI@cluster0.sqjq7km.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(db)
  .then(() => {
    console.log("Database has succefully connneccted");
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

const port: number = Number(process.env.PORT) || 3007;
const server = app.listen(3005, "127.0.0.1", () => {
  console.log(`listening to port 3005`);
});

///pass=4mn2TqRhReEkVL0T
