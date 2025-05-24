"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = orderAssociations;
const ordersModel_1 = __importDefault(require("./ordersModel"));
const itemOrder_1 = __importDefault(require("./itemOrder"));
const productModels_1 = __importDefault(require("../../product/models/product/productModels"));
function orderAssociations() {
    ordersModel_1.default.hasMany(itemOrder_1.default, { foreignKey: "orderId", onDelete: "CASCADE" });
    itemOrder_1.default.belongsTo(ordersModel_1.default, { foreignKey: "orderId" });
    productModels_1.default.hasMany(itemOrder_1.default, { foreignKey: "productId", onDelete: "CASCADE" });
    itemOrder_1.default.belongsTo(productModels_1.default, { foreignKey: "productId" });
    console.log("✅ Sequelize Associations Set Up! For Order");
}
