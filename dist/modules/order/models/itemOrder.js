"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
class OrderItem extends sequelize_1.Model {
}
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: { model: "orders", key: "id" },
        allowNull: false,
        onDelete: "CASCADE", // Ensure order deletion cascades to order items
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: { model: "products", key: "id" },
        allowNull: false,
        onDelete: "CASCADE", // Ensure product deletion cascades to order items
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "order_items",
    modelName: "OrderItem",
});
// Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
// OrderItem.belongsTo(Order, { foreignKey: "orderId" });
// Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "CASCADE" });
// OrderItem.belongsTo(Product, { foreignKey: "productId" });
exports.default = OrderItem;
