"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/analyticsRoutes.ts
const express_1 = __importDefault(require("express"));
const analyticController_1 = require("../controllers/analyticController");
const router = express_1.default.Router();
// Endpoint to track events (e.g., product view, add-to-cart)
router.post("/track-event", analyticController_1.trackEvent);
// Endpoint to fetch top products based on add-to-cart actions
router.get("/top-products", analyticController_1.getTopProducts);
exports.default = router;
