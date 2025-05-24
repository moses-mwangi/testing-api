// // backend/src/events/notification.listener.ts
// eventBus.subscribe("order.created", async (event) => {
//   await notificationDispatcher.send(event.userId, {
//     type: "order",
//     title: "Order Confirmed",
//     message: `Order #${event.orderId} received`,
//     metadata: { orderId: event.orderId },
//   });
// });
