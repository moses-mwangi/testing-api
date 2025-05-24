// controllers/analyticsController.ts
import { Request, Response } from "express";
import sequelize from "../../../shared/config/pg_database";
import AnalyticsEvent from "../models/analyticeModel";

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, productId, userId, quantity, orderId } = req.body;

    const newEvent = await AnalyticsEvent.create({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to track event", error: err });
  }
};

// You can keep this or modify based on the new events you want to track.
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const result = await AnalyticsEvent.findAll({
      attributes: [
        "productId",
        [sequelize.fn("COUNT", sequelize.col("productId")), "viewCount"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "cartAddCount"],
      ],
      where: {
        eventType: ["view", "add_to_cart"], // You can extend it to include 'browse' or 'order'
      },
      group: ["productId"],
      order: [[sequelize.literal("cartAddCount"), "DESC"]],
      limit: 10,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch analytics", error: err });
  }
};

export const getUserHistory = async (userId: number) => {
  try {
    const result = await AnalyticsEvent.findAll({
      where: { userId },
      attributes: ["eventType", "productId", "quantity", "timestamp"],
      order: [["timestamp", "DESC"]],
    });

    return result;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user history");
  }
};

// Advanced analytics for product conversion rates
export const getProductConversionRates = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await sequelize.query(`
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
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to calculate conversion rates", error: err });
  }
};

// Get average views, add-to-cart, and orders per user
export const getUserEngagementMetrics = async (req: Request, res: Response) => {
  try {
    const result = await sequelize.query(`
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
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch user engagement metrics", error: err });
  }
};

// Get the most popular product categories based on user events
export const getPopularCategories = async (req: Request, res: Response) => {
  try {
    const result = await sequelize.query(`
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
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch popular categories", error: err });
  }
};
