"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getReview = exports.getReviews = exports.createReview = void 0;
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const reviewModels_1 = __importDefault(require("../models/reviewModel/reviewModels"));
const userMode_1 = __importDefault(require("../../users/models/userMode"));
const productModels_1 = __importDefault(require("../../product/models/product/productModels"));
const productImageModel_1 = __importDefault(require("../../product/models/product/productImageModel"));
exports.createReview = (0, catchSync_1.default)(async (req, res, next) => {
    const { comment, rating, orderId, productId, userId } = req.body;
    const requiredFields = { comment, rating, orderId, productId, userId };
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            return next(new AppError_1.default(`${field} is required`, 400));
        }
    }
    // Validate rating range
    if (rating < 1 || rating > 5) {
        return next(new AppError_1.default("Rating must be between 1 and 5", 400));
    }
    // Check if user has already reviewed this product
    const existingReview = await reviewModels_1.default.findOne({
        where: { productId, userId: String(userId), orderId },
    });
    if (existingReview) {
        return next(new AppError_1.default("You have already reviewed this product", 400));
    }
    try {
        const review = await reviewModels_1.default.create({
            comment,
            rating,
            orderId,
            productId,
            userId,
        });
        // Update product average rating (assuming you have this functionality)
        await updateProductAverageRating(productId);
        res.status(201).json({
            status: "success",
            message: "Review created successfully!",
            data: { review },
        });
    }
    catch (error) {
        console.error("Error creating review:", error);
        return next(new AppError_1.default("Failed to create review", 500));
    }
});
exports.getReviews = (0, catchSync_1.default)(async (req, res, next) => {
    const { productId } = req.query;
    const whereClause = productId ? { productId } : {};
    const reviews = await reviewModels_1.default.findAll({
        where: whereClause,
        attributes: { exclude: ["updatedAt"] },
        include: [
            {
                model: userMode_1.default,
                as: "user",
                attributes: ["id", "name", "email"],
            },
            {
                model: productModels_1.default,
                as: "product",
                attributes: ["id", "name", "category"],
                // attributes: { exclude: ["createdAt", "updatedAt"] },
                include: [
                    // 🔥 Make this an array
                    {
                        model: productImageModel_1.default,
                        as: "productImages",
                        attributes: ["id", "url", "isMain", "productId"],
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
    if (!reviews.length) {
        return next(new AppError_1.default("No reviews found", 404));
    }
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: { reviews },
    });
});
exports.getReview = (0, catchSync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    const review = await reviewModels_1.default.findByPk(id, {
        include: [
            {
                model: userMode_1.default,
                as: "user",
                attributes: ["id", "name", "email"],
            },
            {
                model: productModels_1.default,
                as: "product",
                attributes: ["name", "id"],
            },
        ],
    });
    if (!review) {
        return next(new AppError_1.default(`Review with ID ${id} not found`, 404));
    }
    res.status(200).json({
        status: "success",
        data: { review },
    });
});
exports.deleteReview = (0, catchSync_1.default)(async (req, res, next) => {
    const { id } = req.params;
    // const userId = (req as any).user.id;
    const review = await reviewModels_1.default.findByPk(id, {
        include: [
            {
                model: userMode_1.default,
                as: "user",
                attributes: ["id", "name", "email"],
            },
            {
                model: productModels_1.default,
                as: "product",
                // attributes: { exclude: ["createdAt", "updatedAt"] },
                attributes: ["name", "id", "category"],
                include: [
                    {
                        model: productImageModel_1.default,
                        as: "productImages",
                        attributes: ["id", "url", "isMain", "productId"],
                    },
                ],
            },
        ],
    });
    if (!review) {
        return next(new AppError_1.default(`Review with ID ${id} not found`, 404));
    }
    // if (review.userId !== userId && (req as any).user?.role !== "admin") {
    //   return next(
    //     new AppError("You are not authorized to delete this review", 403)
    //   );
    // }
    await review.destroy();
    if (review.productId) {
        await updateProductAverageRating(review?.productId);
    }
    res.status(204).json({
        status: "success",
        data: null,
    });
});
// Helper function to update product average rating
async function updateProductAverageRating(productId) {
    const reviews = await reviewModels_1.default.findAll({
        where: { productId },
        attributes: ["rating"],
    });
    if (reviews.length > 0 && reviews) {
        const totalRating = reviews.reduce((sum, review) => sum + (review?.rating || 0), 0);
        const averageRating = totalRating / reviews.length;
        await productModels_1.default.update({ averageRating }, { where: { id: productId } });
    }
}
