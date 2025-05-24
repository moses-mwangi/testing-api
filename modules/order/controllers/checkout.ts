import catchAsync from "../../../shared/utils/catchSync";

import Stripe from "stripe";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import Order from "../models/ordersModel";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: "2025-01-27.acacia",
  apiVersion: "2025-02-24.acacia" as any,
});

export const checkout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, products, shippingAddress, paymentMethod } = req.body;

    try {
      if (paymentMethod === "stripe") {
        // ✅ Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: products.map((product: any) => ({
            price_data: {
              currency: "usd",
              product_data: { name: `Product ${product.productId}` },
              unit_amount: 1000, // $10.00
            },
            quantity: product.quantity,
          })),
          mode: "payment",
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
          metadata: { userId, shippingAddress },
        });

        return res.json({ url: session.url });
      } else if (paymentMethod === "paypal") {
        // ✅ Create PayPal Checkout
        const { data } = await axios.post(
          "https://api-m.sandbox.paypal.com/v2/checkout/orders",
          {
            intent: "CAPTURE",
            purchase_units: [
              { amount: { currency_code: "USD", value: "10.00" } },
            ],
            application_context: {
              return_url: "http://localhost:3000/success",
              cancel_url: "http://localhost:3000/cancel",
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer YOUR_PAYPAL_ACCESS_TOKEN`,
            },
          }
        );

        return res.json({ url: data.links[1].href }); // Redirect to PayPal checkout page
      } else {
        return res.status(400).json({ message: "Invalid payment method" });
      }
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create checkout session.",
      });
    }
  }
);
