"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
// router.use(protect);
// Admin only routes
// router.use(restrictTo("admin"));
router
    .route("/")
    .get(categoryController_1.categoryController.getAllCategories)
    .post(categoryController_1.categoryController.createCategory);
router
    .route("/:id")
    .get(categoryController_1.categoryController.getCategory)
    .patch(categoryController_1.categoryController.updateCategory)
    .delete(categoryController_1.categoryController.deleteCategory);
router
    .route("/:id/subcategories")
    .post(categoryController_1.categoryController.addSubcategory)
    .get(categoryController_1.categoryController.getSubcategories);
router
    .route("/:categoryId/subcategories/:subcategoryId")
    .get(categoryController_1.categoryController.getSubcategory)
    .patch(categoryController_1.categoryController.updateSubcategory)
    .delete(categoryController_1.categoryController.removeSubcategory);
// Filter routes
router.route("/:id/filters").patch(categoryController_1.categoryController.updateFilters);
router
    .route("/:categoryId/subcategories/:subcategoryId/filters")
    .patch(categoryController_1.categoryController.updateFilters);
exports.default = router;
