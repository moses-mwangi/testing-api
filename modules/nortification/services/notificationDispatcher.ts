// // backend/src/services/notificationDispatcher.ts
// import { Notification, User } from "../models";
// import { sendEmail, sendPush, sendSMS } from "./channelServices";

// class NotificationDispatcher {
//   async send(userId: string, payload: NotificationPayload) {
//     const user = await User.findByPk(userId, {
//       include: ["notificationPreferences"],
//     });

//     // 1. Save to database
//     const notification = await Notification.create({
//       userId,
//       ...payload,
//       isRead: false,
//     });

//     // 2. Deliver via preferred channels
//     const prefs = user.notificationPreferences;

//     if (prefs.inApp) {
//       this.sendInApp(userId, notification);
//     }

//     if (prefs.email && user.email) {
//       sendEmail({
//         to: user.email,
//         subject: payload.title,
//         html: this.generateEmailTemplate(payload),
//       });
//     }

//     if (prefs.push && user.fcmToken) {
//       sendPush(user.fcmToken, {
//         title: payload.title,
//         body: payload.message,
//       });
//     }
//   }

//   private sendInApp(userId: string, notification: Notification) {
//     // Real-time via WebSocket
//     websocketServer.sendToUser(userId, {
//       type: "NEW_NOTIFICATION",
//       data: notification,
//     });
//   }
// }

// export const notificationDispatcher = new NotificationDispatcher();
