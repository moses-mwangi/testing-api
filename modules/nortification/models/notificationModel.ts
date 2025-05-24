// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";

// class Notification extends Model {}

// Notification.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: "Users",
//         key: "id",
//       },
//     },
//     type: {
//       type: DataTypes.ENUM(
//         "order",
//         "promotion",
//         "system",
//         "stock",
//         "account",
//         "cart",
//         "shipping",
//         "review"
//       ),
//       allowNull: false,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     message: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     isRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//     priority: {
//       type: DataTypes.ENUM("low", "medium", "high"),
//       defaultValue: "low",
//     },
//     metadata: {
//       type: DataTypes.JSONB,
//       defaultValue: {},
//     },
//     expiresAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     tableName: "notifications",
//     modelName: "Notification",
//     indexes: [{ fields: ["userId", "isRead"] }],
//     sequelize,
//     timestamps: true,
//   }
// );
