import express, { Router } from "express";
import Order from "../models/orderModel";

const router: Router = express.Router();

router.route("/").get(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: "moses mwangi",
  });
});

export default router;
