"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController_1 = require("../controllers/authController");
const jwt_1 = require("../utils/jwt");
const passport_1 = __importDefault(require("../../../shared/config/passport"));
const router = (0, express_1.Router)();
router.route("/signup").post(authMiddleware_1.validUserSignInput, authController_1.signInUser);
router.route("/login").post(authController_1.loginUser);
router.route("/deleteUser/:id").delete(authController_1.deleteCurrentUser);
router.route("/updatePassword").patch(authController_1.protect, authController_1.updatePassword);
router.route("/set-password").post(authController_1.setPassword);
router.route("/request-reset").post(authController_1.requestPasswordReset);
router.route("/validate-reset-token").post(authController_1.validateResetToken);
router.route("/reset-password").post(authController_1.resetPassword);
router.route("/verify-email/:token").post(authController_1.verifyEmail);
router.route("/resend-verification").post(authController_1.resendVerificationEmail);
router.get("/mej", authController_1.protectJwtUser, authController_1.getMe);
router.get("/me", authController_1.protect, authController_1.getMe);
router.route("/google").get(passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
}));
router
    .route("/google/callback")
    .get(passport_1.default.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    req.token = (0, jwt_1.generateToken)({
        id: req.user.id,
        email: req.user.email,
    });
    const token = req.token;
    req.user = req.user;
    const cookieOption = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        // sameSite: "Lax",
    };
    res.cookie("token", token, cookieOption);
    if (req.user && token) {
        res.redirect(`http://localhost:3000/token_verification/?token=${token}`);
    }
    else {
        res.status(400).json({
            message: "Authentication failed",
        });
    }
});
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
});
// router.route("/facebook").get(
//   passport.authenticate("facebook", {
//     scope: ["email"],
//   })
// );
// router
//   .route("/facebook/callback")
//   .get(
//     passport.authenticate("facebook", { failureRedirect: "/" }),
//     (req, res) => {
//       res.redirect("/dashboard");
//     }
//   );
exports.default = router;
