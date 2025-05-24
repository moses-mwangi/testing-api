"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayments = exports.getPayments = void 0;
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
exports.getPayments = (0, catchSync_1.default)(async (req, res, next) => {
    const payment = await paymentModel_1.default.findAll();
    if (!payment) {
        return res.status(404).json({ msg: "Payment not found" });
    }
    res.status(200).json({ msg: "success", payment });
});
exports.deletePayments = (0, catchSync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const payment = await paymentModel_1.default.destroy({ where: { id: Number(id) } });
    if (!payment) {
        return res.status(404).json({ msg: "Payment not found" });
    }
    res.status(200).json({ msg: "success", payment });
});
