import Filter from "./categoryFilterModel";
import Category from "./categoryModel";
import FilterOption from "./filterOption";
import Subcategory from "./subcategoryModel";

export default function categoryAssociations() {
  Category.hasMany(Subcategory, {
    foreignKey: "categoryId",
    as: "subcategories",
    onDelete: "CASCADE",
  });

  Subcategory.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
    onDelete: "CASCADE", /////////as
  });

  Category.hasMany(Filter, {
    foreignKey: "categoryId",
    as: "filters",
    onDelete: "CASCADE",
  });

  Filter.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });

  Subcategory.hasMany(Filter, {
    foreignKey: "subcategoryId",
    as: "filters",
    onDelete: "CASCADE",
  });

  Filter.belongsTo(Subcategory, {
    foreignKey: "subcategoryId",
    onDelete: "CASCADE",
  });

  Filter.hasMany(FilterOption, {
    foreignKey: "filterId",
    as: "options",
    onDelete: "CASCADE",
  });

  FilterOption.belongsTo(Filter, {
    foreignKey: "filterId",
    onDelete: "CASCADE",
  });
  console.log("✅ Sequelize Associations Set Up! For Category");
}

// export { Category, Subcategory, Filter, FilterOption };
