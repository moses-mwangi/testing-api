"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../../shared/config/pg_database"));
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
class Review extends sequelize_1.Model {
}
Review.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    comment: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false,
        validate: {
            len: {
                args: [10, 500],
                msg: "Comment must be between 10 and 500 characters",
            },
        },
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
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
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "products",
            key: "id",
        },
    },
    orderId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Order ID cannot be empty",
            },
        },
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
}, {
    sequelize: pg_database_1.default,
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
});
exports.default = Review;
