import express, { Router } from "express";
import Order from "../models/orderModel";

const router: Router = express.Router();

router.route("/").get(async (req, res, next) => {
  const order = await Order.find();

  if (!order)
    return res.status(200).json({ status: "success", data: { data: "no" } });

  res.status(200).json({ status: "success", data: { data: order } });
});

export default router;
//restaurants
//users
