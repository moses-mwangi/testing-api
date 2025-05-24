"use strict";
// // backend/src/jobs/abandonedCartReminder.ts
// import { notificationDispatcher } from "../services";
// export async function checkAbandonedCarts() {
//   const abandonedCarts = await Cart.getAbandonedCarts();
//   abandonedCarts.forEach(async (cart) => {
//     await notificationDispatcher.send(cart.userId, {
//       type: "cart",
//       title: "Complete Your Purchase",
//       message: `You have ${cart.items.length} items waiting!`,
//       metadata: { cartId: cart.id },
//     });
//   });
// }
