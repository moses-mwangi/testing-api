"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router
    .route("/")
    .get(productController_1.getAllProduct)
    .post(upload.array("images"), productController_1.createProduct);
router
    .route("/:id")
    .delete(productController_1.deleteProduct)
    .patch(upload.array("images"), productController_1.updateProduct)
    .get(productController_1.getOneProduct);
// router.patch(
//   "/:id",
//   upload.array("images")
//   // productController.updateProduct
// );
exports.default = router;
