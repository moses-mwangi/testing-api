import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";

class Category extends Model {
  public id!: number;
  public name!: string;
  public status?: "active" | "not-Active";
  public longName?: string;
  public description!: string;
  public slug!: string;
  public icon?: string;
  public banner?: string;
  public color?: string;
  public featured?: boolean;
  public trending?: boolean;
  public itemCount?: number;
}

Category.init(
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
    status: {
      type: DataTypes.ENUM("active", "not-Active"),
      defaultValue: "active",
    },
    longName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
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
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "categories",
    modelName: "Category",

    indexes: [{ fields: ["name"] }],
    timestamps: true,
  }
);

export default Category;
