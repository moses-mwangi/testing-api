"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const ordersModel_1 = __importDefault(require("../../order/models/ordersModel"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    typescript: true,
});
exports.createPaymentIntent = (0, catchSync_1.default)(async (req, res, next) => {
    try {
        const { amount, currency = "usd", paymentMethodId, 
        // customerId,
        metadata = {}, name, } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return next(new AppError_1.default("Invalid payment amount", 400));
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency,
            // customer: customerId,
            payment_method_types: ["card"],
            payment_method: paymentMethodId,
            // confirm: true,
            metadata: {
                ...metadata,
                userId: metadata.userId?.toString(),
                orderId: metadata.orderId?.toString(),
                name: name,
            },
        });
        res.status(200).json({
            status: "success",
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    }
    catch (err) {
        console.error("ERROR: ", err);
    }
});
exports.handleWebhook = (0, catchSync_1.default)(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        return next(new AppError_1.default("Webhook secret not configured", 500));
    }
    if (!req.rawBody) {
        throw new Error("Missing raw body for verification");
    }
    let event;
    const body = req.rawBody;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
    catch (err) {
        console.error("ERROROROROOROROROROOR", err);
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                await handleSuccessfulPayment(event);
                break;
            case "payment_intent.payment_failed":
                await handleFailedPayment(event);
                break;
            default:
                console.log(`🔹 Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error("🔥 Error processing webhook:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
async function handleSuccessfulPayment(event) {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;
    if (!metadata.orderId || !metadata.userId) {
        throw new Error("Missing orderId or userId in metadata");
    }
    await pg_database_1.default.transaction(async (t) => {
        const payment = await paymentModel_1.default.create({
            userId: parseInt(metadata.userId, 10),
            orderId: parseInt(metadata.orderId, 10),
            stripePaymentId: paymentIntent.id,
            paymentMethod: "card",
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: "success",
            reference: "",
        }, { transaction: t });
        await ordersModel_1.default.updateStatus(parseInt(metadata.orderId, 10), "confirmed", {
            transaction: t,
        });
        await ordersModel_1.default.update({ paymentStatus: "paid", status: "confirmed" }, {
            where: { id: payment.orderId },
            transaction: t,
        });
    });
    console.log("✅ Payment succeeded and order updated:", {
        paymentId: paymentIntent.id,
        orderId: metadata.orderId,
    });
}
async function handleFailedPayment(event) {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;
    console.log("Th webhook FAILED", paymentIntent, metadata);
    if (!metadata.orderId || !metadata.userId) {
        throw new Error("Missing orderId or userId in metadata");
    }
    await pg_database_1.default.transaction(async (t) => {
        const payment = await paymentModel_1.default.create({
            userId: parseInt(metadata.userId, 10),
            orderId: parseInt(metadata.orderId, 10),
            stripePaymentId: paymentIntent.id,
            paymentMethod: "card",
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: "failed",
            reference: "",
        }, { transaction: t });
        await ordersModel_1.default.update({ paymentStatus: "failed", status: "pending" }, {
            where: { id: payment.orderId },
            transaction: t,
        });
    });
    console.log("❌ Payment failed:", {
        paymentId: paymentIntent.id,
        orderId: metadata.orderId,
        reason: paymentIntent.last_payment_error?.message || "Unknown reason",
    });
}
