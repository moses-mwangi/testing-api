import express from "express";
import {
  initializePayment,
  paystackWebhook,
  verifyPayment,
} from "../controllers/PaystackPayments";
import {
  InitializePaymentRequest,
  VerifyPaymentRequest,
  WebhookRequest,
} from "../../../types/routePay";

const router = express.Router();

router
  .route("/initialize")
  .post(express.json(), async (req: InitializePaymentRequest, res, next) => {
    try {
      await initializePayment(req, res);
    } catch (error) {
      next(error);
    }
  });

router.route("/verify").get(async (req: VerifyPaymentRequest, res, next) => {
  try {
    await verifyPayment(req, res);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  // async (req: WebhookRequest, res, next) => {
  async (req, res, next) => {
    try {
      await paystackWebhook(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Payment route error:", error);
    res.status(500).json({
      error: "Payment processing failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
);

export default router;
