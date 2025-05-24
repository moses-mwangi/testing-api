import { Router } from "express";
import {
  getReviews,
  createReview,
  deleteReview,
  getReview,
} from "../controllers/reviewsController";

const router: Router = Router();

router.route("/").get(getReviews).post(createReview);

router.route("/:id").get(getReview).delete(deleteReview);

export default router;
