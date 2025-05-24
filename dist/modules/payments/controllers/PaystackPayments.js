"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.paystackWebhook = exports.verifyPayment = exports.initializePayment = exports.validatePaymentInitialization = void 0;
const paystack_1 = __importDefault(require("paystack"));
const crypto_1 = __importDefault(require("crypto"));
const ordersModel_1 = __importDefault(require("../../order/models/ordersModel"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
const logger_1 = __importStar(require("../utils/logger"));
const express_validator_1 = require("express-validator");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
const paystackClient = (0, paystack_1.default)(process.env.PAYSTACK_SECRET_KEY);
const FRONTEND_URL = String(process.env.FRONTEND_URL) || "http://localhost:3000";
exports.validatePaymentInitialization = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("amount").isNumeric().toFloat(),
    (0, express_validator_1.body)("orderId").isInt().toInt(),
    (0, express_validator_1.body)("userId").isInt().toInt(),
    (0, express_validator_1.body)("currency").optional().isString(),
    (0, express_validator_1.body)("channels").optional().isArray(),
    (0, express_validator_1.body)("phone").optional().isMobilePhone("any"),
    (0, express_validator_1.body)("reference").optional().isString(),
];
const initializePayment = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { reference, email, name, amount, orderId, userId, currency = "KES", channels = ["card", "bank", "mobile_money"], method, phone, metadata = {}, } = req.body;
        logger_1.paymentLogger.initiate({
            orderId,
            userId,
            amount,
        });
        const order = await ordersModel_1.default.findByPk(orderId);
        if (!order) {
            logger_1.default.error(`Order not found: ${orderId}`);
            return res.status(404).json({ error: "Order not found" });
        }
        const existingPayment = await paymentModel_1.default.findOne({
            where: { orderId, status: "success" },
        });
        if (existingPayment) {
            logger_1.default.warn(`Duplicate payment attempt for order: ${orderId}`);
            return res
                .status(400)
                .json({ error: "This order has already been paid" });
        }
        const transaction = await paymentModel_1.default.create({
            orderId,
            userId,
            amount,
            currency,
            status: "initiated",
            paymentMethod: method,
            reference: reference,
        });
        const paymentData = {
            email,
            amount: Math.round(amount * 100),
            reference: transaction.reference,
            callback_url: `${FRONTEND_URL}/payment/verify?orderId=${orderId}`,
            currency,
            channels,
            metadata: {
                ...metadata,
                order_id: orderId.toString(),
                transaction_id: transaction.id.toString(),
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: orderId.toString(),
                    },
                    {
                        display_name: "User ID",
                        variable_name: "user_id",
                        value: userId.toString(),
                    },
                ],
            },
        };
        if (name)
            paymentData.name = name;
        if (phone && channels.includes("mobile_money")) {
            paymentData.mobile_money = {
                phone,
                provider: "",
            };
        }
        logger_1.default.info(`Initializing payment for order ${orderId}`, { paymentData });
        const payment = await paystackClient.transaction.initialize(paymentData);
        await transaction.update({
            paymentReference: payment.data.reference,
            authorizationUrl: payment.data.authorization_url,
        });
        res.json({
            authorization_url: payment.data.authorization_url,
            access_code: payment.data.access_code,
            reference: payment.data.reference,
            transactionId: transaction.id,
        });
        logger_1.paymentLogger.success({
            orderId,
            paymentReference: payment.data.reference,
            amount,
        });
    }
    catch (error) {
        logger_1.default.error("Payment initialization error:", error);
        res.status(500).json({
            error: "Payment initialization failed",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.initializePayment = initializePayment;
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;
        if (!reference) {
            return res.status(400).json({ error: "Reference is required" });
        }
        logger_1.default.info(`Verifying payment with reference: ${reference}`);
        const verification = await paystackClient.transaction.verify(reference);
        if (verification.data.status === "success") {
            const { metadata, gateway_response, channel, amount } = verification.data;
            const paymentRecord = await paymentModel_1.default.findOne({ where: { reference } });
            if (paymentRecord && amount / 100 !== Number(paymentRecord.amount)) {
                logger_1.default.error(`Amount mismatch for payment ${reference}`);
                return res.status(400).json({ error: "Payment amount mismatch" });
            }
            await pg_database_1.default.transaction(async (t) => {
                await paymentModel_1.default.update({
                    status: "success",
                    paymentMethod: channel,
                    gatewayResponse: gateway_response,
                }, { where: { reference }, transaction: t });
                await ordersModel_1.default.updateStatus(parseInt(metadata.orderId, 10), "confirmed", {
                    transaction: t,
                });
                await ordersModel_1.default.update({
                    status: "confirmed",
                    paymentStatus: "paid",
                    paymentMethod: channel,
                    paymentReference: reference,
                }, { where: { id: metadata.order_id }, transaction: t });
            });
            logger_1.default.info(`Payment verified successfully: ${reference}`);
            return res.json({
                success: true,
                data: verification.data,
                orderId: Number(metadata.order_id),
            });
        }
        logger_1.default.warn(`Payment not successful: ${reference}`, {
            data: verification.data,
        });
        res.json({
            success: false,
            message: "Payment not successful",
            data: verification.data,
        });
    }
    catch (error) {
        logger_1.default.error("Payment verification error:", error);
        res.status(500).json({
            error: "Payment verification failed",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.verifyPayment = verifyPayment;
///////////////// WEBHOOK HANDLERS /////////////
const paystackWebhook = async (req, res) => {
    const hash = crypto_1.default
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
        logger_1.paymentLogger.suspicious({
            event: "invalid_webhook_signature",
            ip: req.ip,
            headers: req.headers,
        });
        return res.status(400).send("Invalid signature");
    }
    const event = req.body.event;
    const data = req.body.data;
    logger_1.paymentLogger.webhook(event, {
        reference: data.reference,
        amount: data.amount,
        channel: data.channel,
    });
    logger_1.default.info(`Received Paystack webhook event kk: ${event}`, { data });
    try {
        switch (event) {
            case "charge.success":
                await handleSuccessfulCharge(data);
                break;
            case "transfer.success":
                await handleSuccessfulTransfer(data);
                break;
            case "charge.failed":
                await handleFailedPayment(data);
                break;
            case "transfer.failed":
                await handleFailedTransfer(data);
                break;
            case "refund.processed":
                await handleRefundProcessed(data);
                break;
            case "subscription.create":
                await handleSubscriptionCreated(data);
                break;
            case "invoice.update":
                await handleInvoiceUpdated(data);
                break;
            case "charge.dispute.create":
                await handleDisputeCreated(data);
                break;
            default:
                logger_1.default.info(`Unhandled webhook event: ${event}`);
        }
        res.status(200).send("Webhook received");
    }
    catch (error) {
        logger_1.default.error("Webhook processing error:", error);
        res.status(500).send("Webhook processing failed");
    }
};
exports.paystackWebhook = paystackWebhook;
async function handleSuccessfulCharge(data) {
    const { reference, metadata, channel, gateway_response, amount } = data;
    logger_1.default.info(`Handling successful charge for ${reference}`);
    const payment = await paymentModel_1.default.findOne({ where: { reference } });
    if (!payment) {
        logger_1.default.error(`Payment record not found for reference: ${reference}`);
        return;
    }
    if (Number(amount) / 100 !== Number(payment.amount)) {
        logger_1.default.error(`Amount mismatch for payment ${reference}`);
        await handleSuspiciousPayment(reference, "amount_mismatch");
        return;
    }
    await pg_database_1.default.transaction(async (t) => {
        await paymentModel_1.default.update({
            status: "success",
            paymentMethod: channel,
            gatewayResponse: gateway_response || "Payment successful",
        }, { where: { reference }, transaction: t });
        await ordersModel_1.default.updateStatus(parseInt(metadata.order_id, 10), "confirmed", {
            transaction: t,
        });
        await ordersModel_1.default.update({
            status: "confirmed",
            paymentStatus: "paid",
            paymentMethod: channel,
            paymentReference: reference,
        }, { where: { id: Number(metadata.order_id) }, transaction: t });
    });
    // Here you would:
    // 1. Send payment confirmation email
    // 2. Update inventory
    // 3. Trigger order fulfillment
    logger_1.default.info(`Successfully processed payment for order ${metadata.order_id}`);
}
async function handleSuccessfulTransfer(data) {
    const { reference, metadata } = data;
    logger_1.default.info(`Handling successful transfer for ${reference}`);
    await pg_database_1.default.transaction(async (t) => {
        await paymentModel_1.default.update({
            status: "success",
            paymentMethod: "bank_transfer",
            gatewayResponse: "Bank transfer completed",
        }, { where: { reference }, transaction: t });
        await ordersModel_1.default.updateStatus(parseInt(metadata.order_id, 10), "confirmed", {
            transaction: t,
        });
        await ordersModel_1.default.update({
            status: "confirmed",
            paymentStatus: "paid",
            paymentMethod: "bank_transfer",
            paymentReference: reference,
        }, { where: { id: Number(metadata.order_id) }, transaction: t });
    });
}
async function handleFailedPayment(data) {
    const { reference, metadata, gateway_response } = data;
    logger_1.default.warn(`Handling failed payment for ${reference}`);
    await pg_database_1.default.transaction(async (t) => {
        await paymentModel_1.default.update({
            status: "failed",
            gatewayResponse: gateway_response || "Payment failed",
        }, { where: { reference }, transaction: t });
        await ordersModel_1.default.update({
            status: "pending",
            paymentStatus: "failed",
            paymentReference: reference,
        }, { where: { id: metadata.order_id }, transaction: t });
    });
    // Here you would:
    // 1. Notify customer
    // 2. Possibly retry the payment
}
async function handleFailedTransfer(data) {
    const { reference, metadata, gateway_response } = data;
    logger_1.default.warn(`Handling failed transfer for ${reference}`);
    await pg_database_1.default.transaction(async (t) => {
        await paymentModel_1.default.update({
            status: "failed",
            paymentMethod: "bank_transfer",
            gatewayResponse: gateway_response || "Bank transfer failed",
        }, { where: { reference }, transaction: t });
        await ordersModel_1.default.update({
            status: "pending",
            paymentStatus: "failed",
            paymentMethod: "bank_transfer",
            paymentReference: reference,
        }, { where: { id: metadata.order_id }, transaction: t });
    });
}
async function handleRefundProcessed(data) {
    const { reference, metadata } = data;
    logger_1.default.info(`Handling refund for ${reference}`);
    await pg_database_1.default.transaction(async (t) => {
        await paymentModel_1.default.update({
            status: "refunded",
            gatewayResponse: "Payment refunded",
        }, { where: { reference }, transaction: t });
        await ordersModel_1.default.update({
            status: "pending",
            paymentStatus: "refunded",
        }, { where: { id: metadata.order_id }, transaction: t });
    });
}
async function handleSubscriptionCreated(data) {
    // Implement subscription handling logic
    logger_1.default.info(`Handling subscription creation: ${data.subscription_code}`);
}
async function handleInvoiceUpdated(data) {
    // Implement invoice update handling
    logger_1.default.info(`Handling invoice update: ${data.invoice_id}`);
}
async function handleDisputeCreated(data) {
    // Implement dispute handling
    logger_1.default.warn(`Handling payment dispute: ${data.dispute_id}`);
}
async function handleSuspiciousPayment(reference, reason) {
    // Handle potentially fraudulent payments
    logger_1.default.error(`Suspicious payment detected: ${reference}`, { reason });
    await paymentModel_1.default.update({
        // status: "suspicious",
        status: "failed",
        gatewayResponse: `Flagged as suspicious: ${reason}`,
    }, { where: { reference } });
}
// Additional utility endpoints
const getPaymentStatus = async (req, res) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            return res.status(400).json({ error: "Reference is required" });
        }
        const payment = await paymentModel_1.default.findOne({ where: { reference } });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }
        res.json({
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            reference: payment.reference,
            createdAt: payment.createdAt,
        });
    }
    catch (error) {
        logger_1.default.error("Payment status check error:", error);
        res.status(500).json({ error: "Failed to check payment status" });
    }
};
exports.getPaymentStatus = getPaymentStatus;
