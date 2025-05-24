"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productAssociation;
const productImageModel_1 = __importDefault(require("./productImageModel"));
const productModels_1 = __importDefault(require("./productModels"));
function productAssociation() {
    productModels_1.default.hasMany(productImageModel_1.default, {
        foreignKey: "productId",
        as: "productImages",
        onDelete: "CASCADE",
    });
    productImageModel_1.default.belongsTo(productModels_1.default, {
        foreignKey: "productId",
        as: "product",
        onDelete: "CASCADE",
    });
    console.log("✅ Sequelize Associations Set Up! For Product");
}
