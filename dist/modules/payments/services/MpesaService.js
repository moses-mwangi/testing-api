"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const axios_1 = __importDefault(require("axios"));
const ordersModel_1 = __importDefault(require("../../order/models/ordersModel"));
const moment_1 = __importDefault(require("moment"));
const shortCode = "174379";
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const timestamp = (0, moment_1.default)().format("YYYYMMDDHHmmss");
const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");
class MpesaService {
    constructor(config) {
        this.config = config;
    }
    async generateToken() {
        try {
            const { consumerKey, consumerSecret, environment } = this.config;
            const url = environment === "sandbox"
                ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
                : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
            const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
            const response = await axios_1.default.get(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            console.error("Failed to generate M-Pesa token:", error);
            throw new Error("Failed to generate M-Pesa token");
        }
    }
    async initiateSTKPush(phone, amount, orderId, callbackUrl) {
        const token = await this.generateToken();
        try {
            const response = await axios_1.default.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
                // BusinessShortCode: this.config.lipaNaMpesaShortCode,
                // Shortcode: this.config.lipaNaMpesaShortCode,
                BusinessShortCode: "174379",
                Shortcode: "174379",
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                // PartyB: this.config.lipaNaMpesaShortCode,
                PartyB: "174379",
                PhoneNumber: phone,
                CallBackURL: callbackUrl,
                AccountReference: orderId,
                TransactionDesc: `Payment for Order ${orderId}`,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (err) {
            const error = err;
            if (error.response) {
                console.error("STK Push Error - Response data:", error.response.data);
                console.error("STK Push Error - Status:", error.response.status);
                console.error("STK Push Error - Headers:", error.response.headers);
            }
            else if (error.request) {
                console.error("STK Push Error - No response received:", error.request);
            }
            else {
                console.error("STK Push Error - Setup issue:", error.message);
            }
            throw error;
        }
    }
    async handleCallback(callbackData) {
        const resultCode = callbackData.Body.stkCallback.ResultCode;
        const isSuccessful = resultCode === "0";
        console.log("This is a callback data", callbackData);
        if (isSuccessful) {
            const metadata = callbackData.Body.stkCallback.CallbackMetadata.Item;
            const amount = metadata.find((item) => item.Name === "Amount").Value;
            const mpesaReceiptNumber = metadata.find((item) => item.Name === "MpesaReceiptNumber").Value;
            const phoneNumber = metadata.find((item) => item.Name === "PhoneNumber").Value;
            const orderId = metadata.find((item) => item.Name === "AccountReference")?.Value;
            await ordersModel_1.default.update({
                paymentStatus: "paid",
                mpesaReceiptNumber,
                paymentMethod: "mpesa",
            }, { where: { id: orderId } });
        }
        return { success: isSuccessful };
    }
}
exports.MpesaService = MpesaService;
