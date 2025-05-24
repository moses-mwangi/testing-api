"use strict";
// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";
// class UserNotificationPreference extends Model {}
// UserNotificationPreference.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       unique: true,
//       references: {
//         model: "Users",
//         key: "id",
//       },
//     },
//     email: {
//       type: DataTypes.JSONB,
//       defaultValue: {
//         orders: true,
//         promotions: true,
//         account: true,
//         shipping: true,
//         reviews: true,
//       },
//     },
//     push: {
//       type: DataTypes.JSONB,
//       defaultValue: {
//         orders: true,
//         promotions: false,
//         account: true,
//         shipping: true,
//       },
//     },
//     inApp: {
//       type: DataTypes.JSONB,
//       defaultValue: {
//         orders: true,
//         promotions: true,
//         account: true,
//         shipping: true,
//         reviews: true,
//       },
//     },
//     sms: {
//       type: DataTypes.JSONB,
//       defaultValue: {
//         orders: false,
//         promotions: false,
//         account: false,
//         shipping: false,
//       },
//     },
//   },
//   {
//     tableName: "userNotificationPreferences",
//     modelName: "UserNotificationPreference",
//     indexes: [{ fields: ["userId", "isRead"] }],
//     sequelize,
//     timestamps: true,
//   }
// );
// // UserNotificationPreference.associate = (models) => {
// //   UserNotificationPreference.belongsTo(models.User, {
// //     foreignKey: "userId",
// //     as: "user",
// //   });
// // };
