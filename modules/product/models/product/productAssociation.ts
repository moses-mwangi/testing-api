import ProductImage from "./productImageModel";
import Product from "./productModels";

export default function productAssociation() {
  Product.hasMany(ProductImage, {
    foreignKey: "productId",
    as: "productImages",
    onDelete: "CASCADE",
  });

  ProductImage.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
  });
  console.log("✅ Sequelize Associations Set Up! For Product");
}
