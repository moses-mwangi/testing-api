import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";
import Category from "./categoryModel";

class Subcategory extends Model {
  public id!: number;
  public categoryId!: number;
  public status?: string;
  public name!: string;
  public longName?: string;
  public description?: string;
  public slug!: string;
  public itemCount!: number;
  public trending?: boolean;
}

Subcategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },

    longName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    trending: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "subcategories",
    modelName: "Subcategory",
    indexes: [{ fields: ["categoryId"] }],
    timestamps: true,
  }
);

export default Subcategory;
