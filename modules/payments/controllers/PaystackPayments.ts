import { Request, Response } from "express";
import paystack from "paystack";
import crypto from "crypto";
import Order from "../../order/models/ordersModel";
import Payment from "../models/paymentModel";
import logger, { paymentLogger } from "../utils/logger";
import { body, validationResult } from "express-validator";
import sequelize from "../../../shared/config/pg_database";

const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY!);
const FRONTEND_URL =
  String(process.env.FRONTEND_URL) || "http://localhost:3000";

interface PaymentVerificationRequest {
  reference: string;
}

interface WebhookData {
  id: number;
  domain: string;
  status: "success" | "failed";
  reference: string;
  amount: number;
  gateway_response: string;
  channel?: "card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer";
  metadata: {
    order_id: string;
    transaction_id?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  customer?: {
    email: string;
    phone?: string;
  };
}

export const validatePaymentInitialization = [
  body("email").isEmail().normalizeEmail(),
  body("amount").isNumeric().toFloat(),
  body("orderId").isInt().toInt(),
  body("userId").isInt().toInt(),
  body("currency").optional().isString(),
  body("channels").optional().isArray(),
  body("phone").optional().isMobilePhone("any"),
  body("reference").optional().isString(),
];

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      reference,
      email,
      name,
      amount,
      orderId,
      userId,
      currency = "KES",
      channels = ["card", "bank", "mobile_money"],
      method,
      phone,
      metadata = {},
    } = req.body;

    paymentLogger.initiate({
      orderId,
      userId,
      amount,
    });

    const order = await Order.findByPk(orderId);
    if (!order) {
      logger.error(`Order not found: ${orderId}`);
      return res.status(404).json({ error: "Order not found" });
    }

    const existingPayment = await Payment.findOne({
      where: { orderId, status: "success" },
    });

    if (existingPayment) {
      logger.warn(`Duplicate payment attempt for order: ${orderId}`);

      return res
        .status(400)
        .json({ error: "This order has already been paid" });
    }

    const transaction = await Payment.create({
      orderId,
      userId,
      amount,
      currency,
      status: "initiated",
      paymentMethod: method,
      reference: reference,
    });

    const paymentData: any = {
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

    if (name) paymentData.name = name;

    if (phone && channels.includes("mobile_money")) {
      paymentData.mobile_money = {
        phone,
        provider: "",
      };
    }

    logger.info(`Initializing payment for order ${orderId}`, { paymentData });

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

    paymentLogger.success({
      orderId,
      paymentReference: payment.data.reference,
      amount,
    });
  } catch (error) {
    logger.error("Payment initialization error:", error);
    res.status(500).json({
      error: "Payment initialization failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const verifyPayment = async (
  req: Request<{}, {}, {}, PaymentVerificationRequest>,
  res: Response
) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    logger.info(`Verifying payment with reference: ${reference}`);

    const verification = await paystackClient.transaction.verify(reference);

    if (verification.data.status === "success") {
      const { metadata, gateway_response, channel, amount } = verification.data;

      const paymentRecord = await Payment.findOne({ where: { reference } });
      if (paymentRecord && amount / 100 !== Number(paymentRecord.amount)) {
        logger.error(`Amount mismatch for payment ${reference}`);
        return res.status(400).json({ error: "Payment amount mismatch" });
      }
      await sequelize.transaction(async (t) => {
        await Payment.update(
          {
            status: "success",
            paymentMethod: channel,
            gatewayResponse: gateway_response,
          },
          { where: { reference }, transaction: t }
        );

        await Order.updateStatus(parseInt(metadata.orderId, 10), "confirmed", {
          transaction: t,
        });

        await Order.update(
          {
            status: "confirmed",
            paymentStatus: "paid",
            paymentMethod: channel,
            paymentReference: reference,
          },
          { where: { id: metadata.order_id }, transaction: t }
        );
      });

      logger.info(`Payment verified successfully: ${reference}`);

      return res.json({
        success: true,
        data: verification.data,
        orderId: Number(metadata.order_id),
      });
    }

    logger.warn(`Payment not successful: ${reference}`, {
      data: verification.data,
    });

    res.json({
      success: false,
      message: "Payment not successful",
      data: verification.data,
    });
  } catch (error) {
    logger.error("Payment verification error:", error);
    res.status(500).json({
      error: "Payment verification failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

///////////////// WEBHOOK HANDLERS /////////////
export const paystackWebhook = async (req: Request, res: Response) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    paymentLogger.suspicious({
      event: "invalid_webhook_signature",
      ip: req.ip,
      headers: req.headers,
    });
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const data: WebhookData = req.body.data;

  paymentLogger.webhook(event, {
    reference: data.reference,
    amount: data.amount,
    channel: data.channel,
  });

  logger.info(`Received Paystack webhook event kk: ${event}`, { data });

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
        logger.info(`Unhandled webhook event: ${event}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    logger.error("Webhook processing error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

async function handleSuccessfulCharge(data: WebhookData) {
  const { reference, metadata, channel, gateway_response, amount } = data;

  logger.info(`Handling successful charge for ${reference}`);

  const payment = await Payment.findOne({ where: { reference } });
  if (!payment) {
    logger.error(`Payment record not found for reference: ${reference}`);
    return;
  }

  if (Number(amount) / 100 !== Number(payment.amount)) {
    logger.error(`Amount mismatch for payment ${reference}`);
    await handleSuspiciousPayment(reference, "amount_mismatch");
    return;
  }

  await sequelize.transaction(async (t) => {
    await Payment.update(
      {
        status: "success",
        paymentMethod: channel,
        gatewayResponse: gateway_response || "Payment successful",
      },
      { where: { reference }, transaction: t }
    );

    await Order.updateStatus(parseInt(metadata.order_id, 10), "confirmed", {
      transaction: t,
    });

    await Order.update(
      {
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: channel,
        paymentReference: reference,
      },
      { where: { id: Number(metadata.order_id) }, transaction: t }
    );
  });

  // Here you would:
  // 1. Send payment confirmation email
  // 2. Update inventory
  // 3. Trigger order fulfillment
  logger.info(`Successfully processed payment for order ${metadata.order_id}`);
}

async function handleSuccessfulTransfer(data: WebhookData) {
  const { reference, metadata } = data;

  logger.info(`Handling successful transfer for ${reference}`);

  await sequelize.transaction(async (t) => {
    await Payment.update(
      {
        status: "success",
        paymentMethod: "bank_transfer",
        gatewayResponse: "Bank transfer completed",
      },
      { where: { reference }, transaction: t }
    );

    await Order.updateStatus(parseInt(metadata.order_id, 10), "confirmed", {
      transaction: t,
    });

    await Order.update(
      {
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "bank_transfer",
        paymentReference: reference,
      },
      { where: { id: Number(metadata.order_id) }, transaction: t }
    );
  });
}

async function handleFailedPayment(data: WebhookData) {
  const { reference, metadata, gateway_response } = data;

  logger.warn(`Handling failed payment for ${reference}`);

  await sequelize.transaction(async (t) => {
    await Payment.update(
      {
        status: "failed",
        gatewayResponse: gateway_response || "Payment failed",
      },
      { where: { reference }, transaction: t }
    );

    await Order.update(
      {
        status: "pending",
        paymentStatus: "failed",
        paymentReference: reference,
      },
      { where: { id: metadata.order_id }, transaction: t }
    );
  });

  // Here you would:
  // 1. Notify customer
  // 2. Possibly retry the payment
}

async function handleFailedTransfer(data: WebhookData) {
  const { reference, metadata, gateway_response } = data;

  logger.warn(`Handling failed transfer for ${reference}`);

  await sequelize.transaction(async (t) => {
    await Payment.update(
      {
        status: "failed",
        paymentMethod: "bank_transfer",
        gatewayResponse: gateway_response || "Bank transfer failed",
      },
      { where: { reference }, transaction: t }
    );

    await Order.update(
      {
        status: "pending",
        paymentStatus: "failed",
        paymentMethod: "bank_transfer",
        paymentReference: reference,
      },
      { where: { id: metadata.order_id }, transaction: t }
    );
  });
}

async function handleRefundProcessed(data: WebhookData) {
  const { reference, metadata } = data;

  logger.info(`Handling refund for ${reference}`);

  await sequelize.transaction(async (t) => {
    await Payment.update(
      {
        status: "refunded",
        gatewayResponse: "Payment refunded",
      },
      { where: { reference }, transaction: t }
    );

    await Order.update(
      {
        status: "pending",
        paymentStatus: "refunded",
      },
      { where: { id: metadata.order_id }, transaction: t }
    );
  });
}

async function handleSubscriptionCreated(data: any) {
  // Implement subscription handling logic
  logger.info(`Handling subscription creation: ${data.subscription_code}`);
}

async function handleInvoiceUpdated(data: any) {
  // Implement invoice update handling
  logger.info(`Handling invoice update: ${data.invoice_id}`);
}

async function handleDisputeCreated(data: any) {
  // Implement dispute handling
  logger.warn(`Handling payment dispute: ${data.dispute_id}`);
}

async function handleSuspiciousPayment(reference: string, reason: string) {
  // Handle potentially fraudulent payments
  logger.error(`Suspicious payment detected: ${reference}`, { reason });

  await Payment.update(
    {
      // status: "suspicious",
      status: "failed",
      gatewayResponse: `Flagged as suspicious: ${reason}`,
    },
    { where: { reference } }
  );
}

// Additional utility endpoints
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    const payment = await Payment.findOne({ where: { reference } });
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
  } catch (error) {
    logger.error("Payment status check error:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
};
