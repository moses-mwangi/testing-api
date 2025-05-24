"use strict";
// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";
// import User from "../../users/models/userMode";
// import Product from "../../product/models/product/productModels";
// import OrderItem from "./itemOrder";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// class Order extends Model {
//   static findOneAndUpdate(
//     arg0: { paymentIntentId: any },
//     arg1: {
//       status: string;
//       paymentStatus: string;
//       paymentDetails: { id: any };
//     },
//     arg2: { new: boolean }
//   ) {
//     throw new Error("Method not implemented.");
//   }
//   public id!: number;
//   public userId!: number;
//   public orderId!: number;
//   public totalPrice!: number;
//   public status!:
//     | "pending"
//     | "confirmed"
//     | "shipped"
//     | "delivered"
//     | "cancelled";
//   public paymentStatus!: "paid" | "unpaid" | "failed";
//   public paymentMethod!: string;
//   public statusHistory!: Object;
//   public mpesaReceiptNumber!: string;
//   public shippingAddress!: string;
//   public trackingNumber?: string;
//   paymentDetails: any;
//   public apartment!: string;
//   public city!: string;
//   public country!: string;
//   public county!: string;
//   public email!: string;
//   public fullName!: string;
//   public phoneNumber!: string;
//   public postcode!: string;
//   public streetAddress!: string;
// }
// Order.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "users", key: "id" },
//     },
//     totalPrice: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM(
//         "cancelled",
//         "pending",
//         "confirmed",
//         "shipped",
//         "delivered"
//       ),
//       defaultValue: "pending",
//     },
//     paymentStatus: {
//       type: DataTypes.ENUM("paid", "unpaid", "failed"),
//       defaultValue: "unpaid",
//     },
//     statusHistory: {
//       type: DataTypes.JSON,
//       defaultValue: {
//         pending: null,
//         confirmed: null,
//         processing: null,
//         shipped: null,
//         in_transit: null,
//         delivered: null,
//         cancelled: null,
//       },
//     },
//     paymentMethod: { type: DataTypes.STRING, allowNull: true },
//     mpesaReceiptNumber: { type: DataTypes.STRING, allowNull: true },
//     trackingNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     shippingAddress: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     streetAddress: { type: DataTypes.STRING, allowNull: true },
//     country: { type: DataTypes.STRING, allowNull: true },
//     county: { type: DataTypes.STRING, allowNull: true },
//     phoneNumber: { type: DataTypes.STRING, allowNull: true },
//     email: { type: DataTypes.STRING, allowNull: true },
//     fullName: { type: DataTypes.STRING, allowNull: true },
//     postcode: { type: DataTypes.STRING, allowNull: true },
//     city: { type: DataTypes.STRING, allowNull: true },
//     apartment: { type: DataTypes.STRING, allowNull: true },
//   },
//   {
//     sequelize,
//     tableName: "orders",
//     modelName: "Order",
//   }
// );
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
const userMode_1 = __importDefault(require("../../users/models/userMode"));
const productModels_1 = __importDefault(require("../../product/models/product/productModels"));
const itemOrder_1 = __importDefault(require("./itemOrder"));
class Order extends sequelize_1.Model {
    static findOneAndUpdate(arg0, arg1, arg2) {
        throw new Error("Method not implemented.");
    }
    /**
     * Updates order status and records the timestamp in statusHistory
     * @param orderId ID of the order to update
     * @param newStatus New status to set
     * @returns Updated order
     */
    static async updateStatus(orderId, newStatus, options) {
        const order = await Order.findByPk(orderId, options);
        if (!order) {
            throw new Error("Order not found");
        }
        const validTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["processing", "cancelled"],
            processing: ["shipped", "cancelled"],
            shipped: ["in_transit", "cancelled"],
            in_transit: ["delivered", "cancelled"],
            delivered: [],
            cancelled: [],
        };
        if (!validTransitions[order.status].includes(newStatus)) {
            throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
        }
        const updatedHistory = {
            ...order.statusHistory,
            [newStatus]: new Date(),
        };
        return order.update({
            status: newStatus,
            statusHistory: updatedHistory,
        });
    }
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
    },
    totalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "confirmed", "processing", "shipped", "in_transit", "delivered", "cancelled"),
        defaultValue: "pending",
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM("paid", "unpaid", "failed", "refunded"),
        defaultValue: "unpaid",
    },
    statusHistory: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {
            pending: null,
            confirmed: null,
            processing: null,
            shipped: null,
            in_transit: null,
            delivered: null,
            cancelled: null,
        },
    },
    paymentMethod: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    paymentReference: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    mpesaReceiptNumber: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    trackingNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    shippingAddress: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    streetAddress: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    country: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    county: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        // validate: {
        //   is: /^\+?[\d\s-]+$/,
        // },
    },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    fullName: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    postcode: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    city: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    apartment: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    sequelize: pg_database_1.default,
    tableName: "orders",
    modelName: "Order",
    indexes: [
        {
            fields: ["userId"],
            name: "orders_userId_index",
        },
        {
            fields: ["status"],
            name: "orders_status_index",
        },
        {
            fields: ["trackingNumber"],
            name: "orders_trackingNumber_index",
        },
    ],
    hooks: {
        beforeValidate: (order) => {
            if (!order.statusHistory) {
                order.statusHistory = {
                    pending: null,
                    confirmed: null,
                    processing: null,
                    shipped: null,
                    in_transit: null,
                    delivered: null,
                    cancelled: null,
                };
            }
        },
        beforeCreate: (order) => {
            order.statusHistory = {
                ...order.statusHistory,
                pending: new Date(),
            };
        },
    },
});
userMode_1.default.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(userMode_1.default, { foreignKey: "userId" });
Order.hasMany(itemOrder_1.default, { foreignKey: "orderId", onDelete: "CASCADE" });
itemOrder_1.default.belongsTo(Order, { foreignKey: "orderId" });
productModels_1.default.hasMany(itemOrder_1.default, { foreignKey: "productId", onDelete: "CASCADE" });
itemOrder_1.default.belongsTo(productModels_1.default, { foreignKey: "productId" });
exports.default = Order;
