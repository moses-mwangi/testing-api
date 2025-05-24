import { DataTypes, Model } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";
import Product from "./productModels";

class ProductImage extends Model {
  public id!: number;
  public url!: string;
  public isMain!: boolean;
  productId!: number;
}

ProductImage.init(
  {
    url: {
      type: DataTypes.STRING,
    },
    isMain: {
      type: DataTypes.BOOLEAN,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "images",
    modelName: "ProductImage",
    timestamps: true,
    indexes: [{ fields: ["productId"] }],
  }
);

export default ProductImage;
