"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularCategories = exports.getUserEngagementMetrics = exports.getProductConversionRates = exports.getUserHistory = exports.getTopProducts = exports.trackEvent = void 0;
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
const analyticeModel_1 = __importDefault(require("../models/analyticeModel"));
const trackEvent = async (req, res) => {
    try {
        const { eventType, productId, userId, quantity, orderId } = req.body;
        const newEvent = await analyticeModel_1.default.create({
            eventType,
            productId,
            userId,
            quantity,
            orderId: eventType === "order" ? orderId : null, // Only set orderId for 'order' event
        });
        res.status(200).json({
            message: "Event tracked successfully",
            data: newEvent,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to track event", error: err });
    }
};
exports.trackEvent = trackEvent;
// You can keep this or modify based on the new events you want to track.
const getTopProducts = async (req, res) => {
    try {
        const result = await analyticeModel_1.default.findAll({
            attributes: [
                "productId",
                [pg_database_1.default.fn("COUNT", pg_database_1.default.col("productId")), "viewCount"],
                [pg_database_1.default.fn("SUM", pg_database_1.default.col("quantity")), "cartAddCount"],
            ],
            where: {
                eventType: ["view", "add_to_cart"], // You can extend it to include 'browse' or 'order'
            },
            group: ["productId"],
            order: [[pg_database_1.default.literal("cartAddCount"), "DESC"]],
            limit: 10,
        });
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch analytics", error: err });
    }
};
exports.getTopProducts = getTopProducts;
const getUserHistory = async (userId) => {
    try {
        const result = await analyticeModel_1.default.findAll({
            where: { userId },
            attributes: ["eventType", "productId", "quantity", "timestamp"],
            order: [["timestamp", "DESC"]],
        });
        return result;
    }
    catch (err) {
        console.error(err);
        throw new Error("Failed to fetch user history");
    }
};
exports.getUserHistory = getUserHistory;
// Advanced analytics for product conversion rates
const getProductConversionRates = async (req, res) => {
    try {
        const result = await pg_database_1.default.query(`
      SELECT
        productId,
        COUNT(CASE WHEN eventType = 'view' THEN 1 ELSE NULL END) AS views,
        COUNT(CASE WHEN eventType = 'add_to_cart' THEN 1 ELSE NULL END) AS addedToCart,
        COUNT(CASE WHEN eventType = 'order' THEN 1 ELSE NULL END) AS orders,
        CASE
          WHEN COUNT(CASE WHEN eventType = 'view' THEN 1 ELSE NULL END) > 0
          THEN 
            ROUND(
              (COUNT(CASE WHEN eventType = 'order' THEN 1 ELSE NULL END) * 100.0) /
              COUNT(CASE WHEN eventType = 'view' THEN 1 ELSE NULL END), 2
            )
          ELSE 0
        END AS conversionRate
      FROM analytics_events
      WHERE productId IS NOT NULL
      GROUP BY productId
      ORDER BY conversionRate DESC
    `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Failed to calculate conversion rates", error: err });
    }
};
exports.getProductConversionRates = getProductConversionRates;
// Get average views, add-to-cart, and orders per user
const getUserEngagementMetrics = async (req, res) => {
    try {
        const result = await pg_database_1.default.query(`
      SELECT
        userId,
        COUNT(CASE WHEN eventType = 'view' THEN 1 ELSE NULL END) AS views,
        COUNT(CASE WHEN eventType = 'add_to_cart' THEN 1 ELSE NULL END) AS addedToCart,
        COUNT(CASE WHEN eventType = 'order' THEN 1 ELSE NULL END) AS orders,
        ROUND(AVG(CASE WHEN eventType = 'view' THEN 1 ELSE NULL END), 2) AS avgViewsPerUser,
        ROUND(AVG(CASE WHEN eventType = 'add_to_cart' THEN 1 ELSE NULL END), 2) AS avgAddToCartPerUser,
        ROUND(AVG(CASE WHEN eventType = 'order' THEN 1 ELSE NULL END), 2) AS avgOrdersPerUser
      FROM analytics_events
      WHERE userId IS NOT NULL
      GROUP BY userId
      ORDER BY avgOrdersPerUser DESC
    `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Failed to fetch user engagement metrics", error: err });
    }
};
exports.getUserEngagementMetrics = getUserEngagementMetrics;
// Get the most popular product categories based on user events
const getPopularCategories = async (req, res) => {
    try {
        const result = await pg_database_1.default.query(`
      SELECT
        p.category,
        COUNT(DISTINCT ae.productId) AS productCount,
        SUM(CASE WHEN ae.eventType = 'view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN ae.eventType = 'add_to_cart' THEN 1 ELSE 0 END) AS addToCart,
        SUM(CASE WHEN ae.eventType = 'order' THEN 1 ELSE 0 END) AS orders
      FROM analytics_events ae
      JOIN products p ON ae.productId = p.id
      GROUP BY p.category
      ORDER BY views DESC
    `);
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Failed to fetch popular categories", error: err });
    }
};
exports.getPopularCategories = getPopularCategories;
