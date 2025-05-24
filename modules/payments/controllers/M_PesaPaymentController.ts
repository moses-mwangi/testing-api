import { Request, Response } from "express";
import { MpesaService } from "../services/MpesaService";
import Order from "../../order/models/ordersModel";
import Payment from "../models/paymentModel";
import sequelize from "../../../shared/config/pg_database";

export class MpesaController {
  private mpesaService: MpesaService;

  constructor() {
    this.mpesaService = new MpesaService({
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      environment: "sandbox",
      // environment:
      //   process.env.NODE_ENV === "production" ? "production" : "sandbox",
      shortCode: process.env.MPESA_SHORT_CODE!,
      lipaNaMpesaShortCode: process.env.LIPA_NA_MPESA_SHORTCODE!,
      lipaNaMpesaShortPass: process.env.LIPA_NA_MPESA_PASSKEY!,
    });
  }

  async initiatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { phone, amount, orderId } = req.body;

      if (!phone || !amount || !orderId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const callbackUrl = `${process.env.MPESA_CALLBACK_URL}`;
      const response = await this.mpesaService.initiateSTKPush(
        phone,
        amount,
        orderId,
        callbackUrl
      );

      // const transactionId = `MPESA_${Date.now()}`;
      // const payment = new Payment({
      //   paymentMethod: "mpesa",
      //   amount,
      //   status: "pending",
      //   transactionId,
      //   // reference,
      //   customerPhone: phone,
      // });
      // await payment.save();

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error("MPesa Payment Error:", error);
      res
        .status(500)
        .json({ success: false, error: "Payment initiation failed" });
    }
  }

  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.mpesaService.handleCallback(req.body);
      console.log("The results for controller:", result);

      // await sequelize.transaction(async (t) => {
      // const payment = await Payment.create(
      //     {
      //       userId: parseInt(metadata.userId, 10),
      //       orderId: parseInt(metadata.orderId, 10),
      //       stripePaymentId: paymentIntent.id,
      //       paymentMethod: "card",
      //       amount: paymentIntent.amount / 100,
      //       currency: paymentIntent.currency,
      //       status: "failed",
      //     },
      //     { transaction: t }
      //   );

      //   await Order.update(
      //     { paymentStatus: "failed", status: "pending" },
      //     {
      //       where: { id: payment.orderId },
      //       transaction: t,
      //     }
      //   );
      // });

      res
        .status(200)
        .json({ success: true, msg: "handleCallback", data: result });
    } catch (error) {
      console.error("MPesa Callback Error:", error);
      res
        .status(500)
        .json({ success: false, error: "Callback processing failed" });
    }
  }
}
