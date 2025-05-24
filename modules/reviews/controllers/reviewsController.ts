import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/utils/catchSync";
import AppError from "../../../shared/utils/AppError";
import Review from "../models/reviewModel/reviewModels";
import User from "../../users/models/userMode";
import Product from "../../product/models/product/productModels";
import ProductImage from "../../product/models/product/productImageModel";

export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment, rating, orderId, productId, userId } = req.body;

    const requiredFields = { comment, rating, orderId, productId, userId };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return next(new AppError(`${field} is required`, 400));
      }
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      where: { productId, userId: String(userId), orderId },
    });

    if (existingReview) {
      return next(new AppError("You have already reviewed this product", 400));
    }

    try {
      const review = await Review.create({
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
    } catch (error) {
      console.error("Error creating review:", error);
      return next(new AppError("Failed to create review", 500));
    }
  }
);

export const getReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.query;
    const whereClause = productId ? { productId } : {};

    const reviews = await Review.findAll({
      where: whereClause,
      attributes: { exclude: ["updatedAt"] },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "category"],
          // attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            // 🔥 Make this an array
            {
              model: ProductImage,
              as: "productImages",
              attributes: ["id", "url", "isMain", "productId"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!reviews.length) {
      return next(new AppError("No reviews found", 404));
    }

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
  }
);

export const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },

        {
          model: Product,
          as: "product",
          attributes: ["name", "id"],
        },
      ],
    });

    if (!review) {
      return next(new AppError(`Review with ID ${id} not found`, 404));
    }

    res.status(200).json({
      status: "success",
      data: { review },
    });
  }
);

export const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    // const userId = (req as any).user.id;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },

        {
          model: Product,
          as: "product",
          // attributes: { exclude: ["createdAt", "updatedAt"] },
          attributes: ["name", "id", "category"],
          include: [
            {
              model: ProductImage,
              as: "productImages",
              attributes: ["id", "url", "isMain", "productId"],
            },
          ],
        },
      ],
    });

    if (!review) {
      return next(new AppError(`Review with ID ${id} not found`, 404));
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
  }
);

// Helper function to update product average rating
async function updateProductAverageRating(productId: number) {
  const reviews = await Review.findAll({
    where: { productId },
    attributes: ["rating"],
  });

  if (reviews.length > 0 && reviews) {
    const totalRating = reviews.reduce(
      (sum: number, review: Review) => sum + (review?.rating || 0),
      0
    );
    const averageRating = totalRating / reviews.length;

    await Product.update({ averageRating }, { where: { id: productId } });
  }
}
