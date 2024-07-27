import express, { Router } from "express";

const router: Router = express.Router();

router.route("/").get((req, res, next) => {
  res.status(200).json({
    status: "success",
    data: "moses mwangi",
  });
});

export default router;
