import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  updateOrder,
} from "../controllers/orderController";
import { checkout } from "../controllers/checkout";

const router = express.Router();
router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.route("/:id").patch(updateOrder);
// router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

router.post("/checkout", checkout);

export default router;
