"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = categoryAssociations;
const categoryFilterModel_1 = __importDefault(require("./categoryFilterModel"));
const categoryModel_1 = __importDefault(require("./categoryModel"));
const filterOption_1 = __importDefault(require("./filterOption"));
const subcategoryModel_1 = __importDefault(require("./subcategoryModel"));
function categoryAssociations() {
    categoryModel_1.default.hasMany(subcategoryModel_1.default, {
        foreignKey: "categoryId",
        as: "subcategories",
        onDelete: "CASCADE",
    });
    subcategoryModel_1.default.belongsTo(categoryModel_1.default, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "CASCADE", /////////as
    });
    categoryModel_1.default.hasMany(categoryFilterModel_1.default, {
        foreignKey: "categoryId",
        as: "filters",
        onDelete: "CASCADE",
    });
    categoryFilterModel_1.default.belongsTo(categoryModel_1.default, { foreignKey: "categoryId", onDelete: "CASCADE" });
    subcategoryModel_1.default.hasMany(categoryFilterModel_1.default, {
        foreignKey: "subcategoryId",
        as: "filters",
        onDelete: "CASCADE",
    });
    categoryFilterModel_1.default.belongsTo(subcategoryModel_1.default, {
        foreignKey: "subcategoryId",
        onDelete: "CASCADE",
    });
    categoryFilterModel_1.default.hasMany(filterOption_1.default, {
        foreignKey: "filterId",
        as: "options",
        onDelete: "CASCADE",
    });
    filterOption_1.default.belongsTo(categoryFilterModel_1.default, {
        foreignKey: "filterId",
        onDelete: "CASCADE",
    });
    console.log("✅ Sequelize Associations Set Up! For Category");
}
// export { Category, Subcategory, Filter, FilterOption };
