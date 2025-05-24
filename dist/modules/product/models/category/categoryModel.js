"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
class Category extends sequelize_1.Model {
}
Category.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "not-Active"),
        defaultValue: "active",
    },
    longName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    icon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
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
    featured: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "categories",
    modelName: "Category",
    indexes: [{ fields: ["name"] }],
    timestamps: true,
});
exports.default = Category;
