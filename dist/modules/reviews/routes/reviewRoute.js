"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewsController_1 = require("../controllers/reviewsController");
const router = (0, express_1.Router)();
router.route("/").get(reviewsController_1.getReviews).post(reviewsController_1.createReview);
router.route("/:id").get(reviewsController_1.getReview).delete(reviewsController_1.deleteReview);
exports.default = router;
