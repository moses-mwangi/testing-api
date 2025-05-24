import Product from "../../../product/models/product/productModels";
import User from "../../../users/models/userMode";
import Review from "./reviewModels";

export default function reviewAssociation() {
  Review.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Review.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
  });

  console.log("✅ Sequelize Associations Set Up! For reviews");
}
