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
const orderModel_1 = __importDefault(require("./models/orderModel"));
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
app.use("/api/order", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield orderModel_1.default.find();
    if (!order)
        return res.status(200).json({ status: "success", data: { data: "no" } });
    res.status(200).json({ status: "success", data: { data: order } });
}));
exports.default = app;
