"use strict";
// // models/analyticsEvent.ts
// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";
// import User from "../../users/models/userMode";
// import Product from "../../product/models/productModels";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// class AnalyticsEvent extends Model {
//   public id!: number;
//   public eventType!: "view" | "add_to_cart" | "browse" | "order"; // Added 'browse' and 'order'
//   public productId!: number;
//   public userId!: number;
//   public quantity!: number;
//   public orderId!: number | null; // Optional field for order events
//   public timestamp!: Date;
// }
// AnalyticsEvent.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     eventType: {
//       type: DataTypes.ENUM("view", "add_to_cart", "browse", "order"), // Added 'browse' and 'order'
//       allowNull: false,
//     },
//     productId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "products", key: "id" },
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "users", key: "id" },
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       defaultValue: 1,
//     },
//     orderId: {
//       type: DataTypes.INTEGER,
//       allowNull: true, // Only needed for 'order' event
//     },
//     timestamp: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     sequelize,
//     tableName: "analytics_events",
//     modelName: "AnalyticsEvent",
//   }
// );
// export default AnalyticsEvent;
// models/analyticsEvent.ts
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
class AnalyticsEvent extends sequelize_1.Model {
}
AnalyticsEvent.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    eventType: {
        type: sequelize_1.DataTypes.ENUM("view", "add_to_cart", "browse", "order", "checkout", "review", "wishlist_add", "wishlist_remove"),
        allowNull: false,
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" }, // Foreign key to Product
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" }, // Foreign key to User
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "analytics_events",
    modelName: "AnalyticsEvent",
});
exports.default = AnalyticsEvent;
