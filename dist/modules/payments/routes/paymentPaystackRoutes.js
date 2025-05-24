"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PaystackPayments_1 = require("../controllers/PaystackPayments");
const router = express_1.default.Router();
router
    .route("/initialize")
    .post(express_1.default.json(), async (req, res, next) => {
    try {
        await (0, PaystackPayments_1.initializePayment)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.route("/verify").get(async (req, res, next) => {
    try {
        await (0, PaystackPayments_1.verifyPayment)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post("/webhook", express_1.default.json({ type: "application/json" }), 
// async (req: WebhookRequest, res, next) => {
async (req, res, next) => {
    try {
        await (0, PaystackPayments_1.paystackWebhook)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Error handling middleware
router.use((error, req, res, next) => {
    console.error("Payment route error:", error);
    res.status(500).json({
        error: "Payment processing failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
});
exports.default = router;
