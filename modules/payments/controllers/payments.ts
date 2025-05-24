import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/utils/catchSync";
import Payment from "../models/paymentModel";

export const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payment = await Payment.findAll();

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    res.status(200).json({ msg: "success", payment });
  }
);

export const deletePayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payment = await Payment.destroy({ where: { id: Number(id) } });

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    res.status(200).json({ msg: "success", payment });
  }
);
