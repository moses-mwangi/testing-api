import express from "express";
import mongoose from "mongoose";

const app = express();
const Order = mongoose.model("Order", new mongoose.Schema({}));

// Connect to the database
mongoose
  .connect("your_database_connection_string", {})
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.get("/api/orders", async (req, res) => {
  console.log("Received request for /api/orders");

  try {
    const orders = await Order.find().exec();
    if (!orders.length) {
      console.log("No orders found");
      return res.status(200).json({ status: "success", data: { data: "no" } });
    }

    console.log("Orders retrieved successfully");
    res.status(200).json({ status: "success", data: { data: orders } });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import app from "./app";
// // const dotenv = require("dotenv");
// // const mongoose = require("mongoose");
// // const app = require("./app");

// const env = process.env.NODE_ENV || "development";

// dotenv.config({ path: ".env" });

// process.on("uncaughtException", (err) => {
//   console.error("UNHANDLED EXCEPTION ---- Shutting down 💥");
//   console.error(err.name, err.stack, err.message);
//   process.exit(1);
// });

// const db =
//   "mongodb+srv://mosesmwangime:4Owf3JAY8YpVbT0y@fooddelivercluster.q3ihtsr.mongodb.net/delivery?retryWrites=true&w=majority&appName=FoodDeliverCluster";
// mongoose
//   .connect(db)
//   .then(() => {
//     console.log("Database has succefully connneccted");
//   })
//   .then(() => console.log("Database connected successfully"))
//   .catch((err) => console.error("Database connection error:", err));

// const port: number = Number(process.env.PORT) || 3005;
// const server = app.listen(3005, "127.0.0.1", () => {
//   console.log(`listening to port 3005`);
// });
