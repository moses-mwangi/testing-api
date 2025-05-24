// routes/analyticsRoutes.ts
import express from "express";
import { trackEvent, getTopProducts } from "../controllers/analyticController";

const router = express.Router();

// Endpoint to track events (e.g., product view, add-to-cart)
router.post("/track-event", trackEvent);

// Endpoint to fetch top products based on add-to-cart actions
router.get("/top-products", getTopProducts);

export default router;
