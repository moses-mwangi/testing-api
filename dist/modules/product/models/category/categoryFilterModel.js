"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
const categoryModel_1 = __importDefault(require("./categoryModel"));
const subcategoryModel_1 = __importDefault(require("./subcategoryModel"));
class Filter extends sequelize_1.Model {
}
Filter.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: categoryModel_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    subcategoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: subcategoryModel_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "filters",
    modelName: "Filter",
    indexes: [{ fields: ["categoryId"] }],
    timestamps: true,
});
exports.default = Filter;
