import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";

class Product extends Model {
  public id!: number;
  public name!: string;
  public category!: string;
  public subCategory!: string;
  public price!: number;
  public costPrice!: number;
  public description!: string;
  public stock!: number;
  public brand?: string;
  public trending?: boolean;
  public images!: string[];
  public specifications?: object[];
  public discount?: number;
  public ratings?: number;
  public averageRating?: number;
  public reviews?: object[];
}

Product.init(
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subCategory: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("in stock", "out of stock"),
      allowNull: false,
      defaultValue: "in stock",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trending: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    specifications: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: true,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    averageRating: { type: DataTypes.FLOAT, allowNull: true },
    ratings: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10,
      },
    },
    reviews: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "products",
    modelName: "Product",
    timestamps: true,
  }
);

export default Product;
