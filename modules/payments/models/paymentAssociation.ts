import Order from "../../order/models/ordersModel";
import User from "../../users/models/userMode";
import Payment from "./paymentModel";

export default function paymentAssociation() {
  Payment.belongsTo(Order, {
    foreignKey: "orderId",
    as: "user",
  });

  Payment.belongsTo(User, {
    foreignKey: "userId",
    as: "product",
  });

  console.log("✅ Sequelize Associations Set Up! For Payment");
}
