"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
const Order = mongoose_1.default.model("Order", new mongoose_1.default.Schema({}));
// Connect to the database
mongoose_1.default
    .connect("your_database_connection_string", {})
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection error:", err));
app.get("/api/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received request for /api/orders");
    try {
        const orders = yield Order.find().exec();
        if (!orders.length) {
            console.log("No orders found");
            return res.status(200).json({ status: "success", data: { data: "no" } });
        }
        console.log("Orders retrieved successfully");
        res.status(200).json({ status: "success", data: { data: orders } });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ status: "error", message: "Server Error" });
    }
}));
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
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
