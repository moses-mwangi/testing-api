import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";
import Category from "./categoryModel";
import Subcategory from "./subcategoryModel";

class Filter extends Model {
  public id!: number;
  public name!: string;
  public categoryId?: number;
  public subcategoryId?: number;
}

Filter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Subcategory,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "filters",
    modelName: "Filter",
    indexes: [{ fields: ["categoryId"] }],
    timestamps: true,
  }
);

export default Filter;
