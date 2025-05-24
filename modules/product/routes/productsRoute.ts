import { Router } from "express";
import {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOneProduct,
} from "../controllers/productController";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router: Router = Router();

router
  .route("/")
  .get(getAllProduct)
  .post(upload.array("images"), createProduct);

router
  .route("/:id")
  .delete(deleteProduct)
  .patch(upload.array("images"), updateProduct)
  .get(getOneProduct);

// router.patch(
//   "/:id",
//   upload.array("images")
//   // productController.updateProduct
// );

export default router;
