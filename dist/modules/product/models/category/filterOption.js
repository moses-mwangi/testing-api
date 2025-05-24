"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
const categoryFilterModel_1 = __importDefault(require("./categoryFilterModel"));
class FilterOption extends sequelize_1.Model {
}
FilterOption.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    filterId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: categoryFilterModel_1.default,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    option: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "filter_options",
    modelName: "FilterOption",
    indexes: [{ fields: ["filterId"] }],
    timestamps: true,
});
exports.default = FilterOption;
