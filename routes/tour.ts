import express, { Router } from "express";
import Tour from "../models/tourModel";

const router: Router = express.Router();

router.route("/").get(async (req, res, next) => {
  const order = await Tour.find();

  if (!order)
    return res.status(200).json({ status: "success", data: { data: "no" } });

  res.status(200).json({ status: "success", data: { data: order } });
});

export default router;
