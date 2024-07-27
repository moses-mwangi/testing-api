"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const env = process.env.NODE_ENV || "development";
dotenv_1.default.config({ path: ".env" });
process.on("uncaughtException", (err) => {
    console.error("UNHANDLED EXCEPTION ---- Shutting down 💥");
    console.error(err.name, err.stack, err.message);
    process.exit(1);
});
const db = "mongodb+srv://mosesmwangime:4Owf3JAY8YpVbT0y@fooddelivercluster.q3ihtsr.mongodb.net/delivery?retryWrites=true&w=majority&appName=FoodDeliverCluster";
mongoose_1.default
    .connect(db)
    .then(() => {
    console.log("Database has succefully connneccted");
})
    .catch((err) => console.error(err, "moess"));
const port = Number(process.env.PORT) || 3005;
const server = app_1.default.listen(port, "127.0.0.1", () => {
    console.log(`listening to port ${port}`);
});
