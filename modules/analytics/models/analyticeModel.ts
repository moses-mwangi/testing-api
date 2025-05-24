// // models/analyticsEvent.ts
// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";
// import User from "../../users/models/userMode";
// import Product from "../../product/models/productModels";

// class AnalyticsEvent extends Model {
//   public id!: number;
//   public eventType!: "view" | "add_to_cart" | "browse" | "order"; // Added 'browse' and 'order'
//   public productId!: number;
//   public userId!: number;
//   public quantity!: number;
//   public orderId!: number | null; // Optional field for order events
//   public timestamp!: Date;
// }

// AnalyticsEvent.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     eventType: {
//       type: DataTypes.ENUM("view", "add_to_cart", "browse", "order"), // Added 'browse' and 'order'
//       allowNull: false,
//     },
//     productId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "products", key: "id" },
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "users", key: "id" },
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       defaultValue: 1,
//     },
//     orderId: {
//       type: DataTypes.INTEGER,
//       allowNull: true, // Only needed for 'order' event
//     },
//     timestamp: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     sequelize,
//     tableName: "analytics_events",
//     modelName: "AnalyticsEvent",
//   }
// );

// export default AnalyticsEvent;

// models/analyticsEvent.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../../../shared/config/pg_database";
import User from "../../users/models/userMode";
import Product from "../../product/models/product/productModels";

class AnalyticsEvent extends Model {
  public id!: number;
  public eventType!:
    | "view"
    | "add_to_cart"
    | "browse"
    | "order"
    | "checkout"
    | "review"
    | "wishlist_add"
    | "wishlist_remove";
  public productId!: number;
  public userId!: number;
  public quantity!: number;
  public timestamp!: Date;
}

AnalyticsEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.ENUM(
        "view",
        "add_to_cart",
        "browse",
        "order",
        "checkout",
        "review",
        "wishlist_add",
        "wishlist_remove"
      ),
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" }, // Foreign key to Product
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" }, // Foreign key to User
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "analytics_events",
    modelName: "AnalyticsEvent",
  }
);

export default AnalyticsEvent;
