// // backend/src/services/shippingService.ts
// async function updateShippingStatus(orderId: string, status: ShippingStatus) {
//   const order = await Order.findByPk(orderId);

//   await notificationDispatcher.send(order.userId, {
//     type: "shipping",
//     title: "Shipping Update",
//     message: `Your order is now ${status}`,
//     metadata: { orderId, trackingUrl: order.trackingUrl },
//   });
// }
