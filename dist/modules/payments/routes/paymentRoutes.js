"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const M_PesaPaymentController_1 = require("../controllers/M_PesaPaymentController");
const CardPaymentController_1 = require("../controllers/CardPaymentController");
const body_parser_1 = __importDefault(require("body-parser"));
const payments_1 = require("../controllers/payments");
const router = express_1.default.Router();
router.route("/").get(payments_1.getPayments);
router.route("/:id").delete(payments_1.deletePayments);
//////  M_PESA PAYMENTS
const mpesaController = new M_PesaPaymentController_1.MpesaController();
router.post("/mpesa", (req, res) => mpesaController.initiatePayment(req, res));
router.post("/mpesa/callback", (req, res) => mpesaController.handleCallback(req, res));
////// CARD PAYMENTS
router.route("/card").post(CardPaymentController_1.createPaymentIntent);
router.route("/card/webhook").post(body_parser_1.default.raw({ type: "application/json" }), (req, res, next) => {
    req.rawBody = req.body.toString("utf8");
    next();
}, CardPaymentController_1.handleWebhook);
exports.default = router;
