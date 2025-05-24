import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../../shared/config/pg_database";
import User from "../../../users/models/userMode";
import Product from "../../../product/models/product/productModels";

// interface ReviewAttributes {
//   id: number;
//   comment: string;
//   rating: number;
//   orderId: string;
//   productId: number;
//   userId: number;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// interface ReviewCreationAttributes
//   extends Optional<ReviewAttributes, "id" | "createdAt" | "updatedAt"> {}

// class Review
//   extends Model<ReviewAttributes, ReviewCreationAttributes>
//   implements ReviewAttributes

class Review extends Model {
  public id!: number;
  public comment!: string;
  public rating!: number;
  public orderId!: string;
  public productId!: number;
  public userId!: number;
  // public readonly createdAt!: Date;
  // public readonly updatedAt!: Date;

  // Associations will be defined here
  // public readonly user?: User;
  // public readonly product?: Product;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        len: {
          args: [10, 500],
          msg: "Comment must be between 10 and 500 characters",
        },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Rating must be at least 1",
        },
        max: {
          args: [5],
          msg: "Rating must be at most 5",
        },
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Order ID cannot be empty",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "reviews",
    modelName: "Review",
    timestamps: true,
    indexes: [
      {
        // unique: true,
        fields: ["orderId"],
        name: "unique_order_review",
      },
      {
        fields: ["productId"],
        name: "product_reviews_index",
      },
      {
        fields: ["userId"],
        name: "user_reviews_index",
      },
    ],
  }
);

export default Review;
