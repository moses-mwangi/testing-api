"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = reviewAssociation;
const productModels_1 = __importDefault(require("../../../product/models/product/productModels"));
const userMode_1 = __importDefault(require("../../../users/models/userMode"));
const reviewModels_1 = __importDefault(require("./reviewModels"));
function reviewAssociation() {
    reviewModels_1.default.belongsTo(userMode_1.default, {
        foreignKey: "userId",
        as: "user",
    });
    reviewModels_1.default.belongsTo(productModels_1.default, {
        foreignKey: "productId",
        as: "product",
    });
    console.log("✅ Sequelize Associations Set Up! For reviews");
}
