import express, { Router } from "express";
import User from "../models/userModel";

const router: Router = express.Router();

router.route("/").get(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export default router;
