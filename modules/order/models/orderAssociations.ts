import Order from "./ordersModel";
import OrderItem from "./itemOrder";
import Product from "../../product/models/product/productModels";

export default function orderAssociations() {
  Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "CASCADE" });
  OrderItem.belongsTo(Product, { foreignKey: "productId" });

  console.log("✅ Sequelize Associations Set Up! For Order");
}
