// // backend/src/services/marketingService.ts
// async function sendPromotion(userIds: string[], promo: Promotion) {
//   for (const userId of userIds) {
//     await notificationDispatcher.send(userId, {
//       type: "promotion",
//       title: promo.title,
//       message: promo.description,
//       metadata: { promoCode: promo.code },
//       priority: "low",
//     });
//   }
// }
