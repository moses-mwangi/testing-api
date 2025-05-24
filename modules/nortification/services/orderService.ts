// // backend/src/services/orderService.ts
// import { notificationDispatcher } from "./notificationDispatcher";

// class OrderService {
//   async createOrder(userId: string, orderData: OrderDTO) {
//     const order = await Order.create(orderData);

//     await notificationDispatcher.send(userId, {
//       type: "order",
//       title: "Order Confirmed",
//       message: `Your order #${order.id} has been placed`,
//       metadata: { orderId: order.id },
//       priority: "high",
//     });

//     return order;
//   }
// }
