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
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users_1 = __importDefault(require("./routes/users"));
const order_1 = __importDefault(require("./routes/order"));
const tour_1 = __importDefault(require("./routes/tour"));
const restaurantModel_1 = __importDefault(require("./models/restaurantModel"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://food-delivery-bkrk.vercel.app",
    "https://food-delivery-dasboard-pk5j.vercel.app",
    "https://food-delivery-dasboard.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log("Testing middleware");
    next();
});
app.use("/api/users", users_1.default);
app.use("/api/tours", tour_1.default);
app.use("/api/orders", order_1.default);
app.get("/api/restaurants", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received request for /api/orders");
    try {
        const orders = yield restaurantModel_1.default.find();
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
exports.default = app;
