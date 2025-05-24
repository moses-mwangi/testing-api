"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
const productModels_1 = __importDefault(require("./productModels"));
class ProductImage extends sequelize_1.Model {
}
ProductImage.init({
    url: {
        type: sequelize_1.DataTypes.STRING,
    },
    isMain: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: productModels_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "images",
    modelName: "ProductImage",
    timestamps: true,
    indexes: [{ fields: ["productId"] }],
});
exports.default = ProductImage;
