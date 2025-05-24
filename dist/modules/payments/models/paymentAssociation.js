"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = paymentAssociation;
const ordersModel_1 = __importDefault(require("../../order/models/ordersModel"));
const userMode_1 = __importDefault(require("../../users/models/userMode"));
const paymentModel_1 = __importDefault(require("./paymentModel"));
function paymentAssociation() {
    paymentModel_1.default.belongsTo(ordersModel_1.default, {
        foreignKey: "orderId",
        as: "user",
    });
    paymentModel_1.default.belongsTo(userMode_1.default, {
        foreignKey: "userId",
        as: "product",
    });
    console.log("✅ Sequelize Associations Set Up! For Payment");
}
