"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
class Payment extends sequelize_1.Model {
}
Payment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    stripePaymentId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "KES",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("initiated", "pending", "success", "failed", "refunded"),
        defaultValue: "initiated",
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM("card", "bank", "bank_transfer", "mobile_money", "ussd", "qr"),
    },
    reference: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    paymentReference: {
        type: sequelize_1.DataTypes.STRING,
    },
    authorizationUrl: {
        type: sequelize_1.DataTypes.TEXT,
    },
    gatewayResponse: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, {
    sequelize: pg_database_1.default,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    indexes: [
        // {
        //   fields: ["reference"],
        //   unique: true,
        // },
        {
            fields: ["orderId"],
        },
    ],
});
exports.default = Payment;
