"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
const categoryModel_1 = __importDefault(require("./categoryModel"));
class Subcategory extends sequelize_1.Model {
}
Subcategory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: categoryModel_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "Active",
    },
    longName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    itemCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    trending: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "subcategories",
    modelName: "Subcategory",
    indexes: [{ fields: ["categoryId"] }],
    timestamps: true,
});
exports.default = Subcategory;
