// // services/notificationService.js
// const { Notification, User, UserNotificationPreference } = require("../models");
// const { sendEmail } = require("./emailService");
// const { sendPushNotification } = require("./pushService");

// class NotificationService {
//   static async createNotification(userId, notificationData) {
//     const user = await User.findByPk(userId, {
//       include: [
//         {
//           model: UserNotificationPreference,
//           as: "notificationPreferences",
//         },
//       ],
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Create the base notification
//     const notification = await Notification.create({
//       userId,
//       ...notificationData,
//     });

//     // Check preferences and send through appropriate channels
//     const preferences = user.notificationPreferences || {};

//     // In-app notification is always created
//     if (preferences.inApp?.[notificationData.type] !== false) {
//       // Already created above
//     }

//     // Email notification
//     if (preferences.email?.[notificationData.type]) {
//       await sendEmail({
//         to: user.email,
//         subject: notificationData.title,
//         html: this.generateEmailTemplate(notificationData),
//       });
//     }

//     // Push notification
//     if (
//       preferences.push?.[notificationData.type] &&
//       user.fcmTokens?.length > 0
//     ) {
//       await sendPushNotification({
//         tokens: user.fcmTokens,
//         title: notificationData.title,
//         body: notificationData.message,
//         data: notificationData.metadata,
//       });
//     }

//     // SMS notification (if implemented)
//     if (preferences.sms?.[notificationData.type] && user.phoneNumber) {
//       // Implement SMS sending logic
//     }

//     return notification;
//   }

//   static generateEmailTemplate(notification) {
//     // Implement your email template logic
//     return `
//       <div>
//         <h2>${notification.title}</h2>
//         <p>${notification.message}</p>
//         ${
//           notification.metadata.orderId
//             ? `<a href="${process.env.SITE_URL}/orders/${notification.metadata.orderId}">View Order</a>`
//             : ""
//         }
//       </div>
//     `;
//   }

//   static async markAsRead(userId, notificationId) {
//     const [updated] = await Notification.update(
//       { isRead: true },
//       {
//         where: {
//           id: notificationId,
//           userId,
//         },
//       }
//     );

//     if (updated === 0) {
//       throw new Error("Notification not found or not owned by user");
//     }

//     return Notification.findByPk(notificationId);
//   }

//   static async markAllAsRead(userId) {
//     await Notification.update(
//       { isRead: true },
//       {
//         where: {
//           userId,
//           isRead: false,
//         },
//       }
//     );

//     return Notification.findAll({
//       where: { userId },
//       order: [["createdAt", "DESC"]],
//       limit: 20,
//     });
//   }

//   static async getUserNotifications(userId, { limit = 20, offset = 0 } = {}) {
//     return Notification.findAll({
//       where: { userId },
//       order: [["createdAt", "DESC"]],
//       limit,
//       offset,
//     });
//   }

//   static async updateNotificationPreferences(userId, preferences) {
//     const [prefs, created] = await UserNotificationPreference.upsert(
//       {
//         userId,
//         ...preferences,
//       },
//       {
//         returning: true,
//       }
//     );

//     return prefs;
//   }
// }

// module.exports = NotificationService;
