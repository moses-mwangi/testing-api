// types/routes.d.ts
import { Request } from "express";

export interface InitializePaymentRequest extends Request {
  body: {
    email: string;
    amount: number;
    orderId: string;
    userId: string;
    currency?: string;
    channels?: (
      | "card"
      | "bank"
      | "ussd"
      | "qr"
      | "mobile_money"
      | "bank_transfer"
    )[];
    metadata?: {
      order_id: string;
      transaction_id?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
  };
}

export interface VerifyPaymentRequest extends Request {
  query: {
    reference: string;
  };
}

export interface WebhookRequest extends Request {
  body: {
    event: string;
    data: {
      reference: string;
      metadata: {
        order_id: string;
        transaction_id?: string;
      };
      channel?:
        | "card"
        | "bank"
        | "ussd"
        | "qr"
        | "mobile_money"
        | "bank_transfer";
      gateway_response?: string;
    };
  };
  headers: {
    "x-paystack-signature"?: string;
  };
}
