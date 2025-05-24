"use strict";
// // workers/notificationWorker.js
// const Queue = require("bull");
// const NotificationService = require("../services/notificationService");
// const notificationQueue = new Queue("notifications", process.env.REDIS_URL);
// // Process jobs
// notificationQueue.process(async (job) => {
//   const { userId, notificationData } = job.data;
//   await NotificationService.createNotification(userId, notificationData);
// });
// // Add scheduled notifications
// async function scheduleAbandonedCartNotification(userId, cartItems) {
//   await notificationQueue.add(
//     {
//       userId,
//       notificationData: {
//         type: "cart",
//         title: "Your cart is waiting!",
//         message: `You have ${cartItems.length} items in your cart`,
//         metadata: { cartItems },
//       },
//     },
//     {
//       delay: 3600000, // 1 hour
//       attempts: 3,
//     }
//   );
// }
// module.exports = {
//   notificationQueue,
//   scheduleAbandonedCartNotification,
// };
