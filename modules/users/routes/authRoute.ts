import { Router } from "express";
import { validUserSignInput } from "../middleware/authMiddleware";
import {
  getMe,
  loginUser,
  protect,
  signInUser,
  protectJwtUser,
  updatePassword,
  deleteCurrentUser,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  setPassword,
} from "../controllers/authController";
import { generateToken } from "../utils/jwt";
import passport from "../../../shared/config/passport";

const router: Router = Router();

router.route("/signup").post(validUserSignInput, signInUser);
router.route("/login").post(loginUser);
router.route("/deleteUser/:id").delete(deleteCurrentUser);
router.route("/updatePassword").patch(protect, updatePassword);
router.route("/set-password").post(setPassword);

router.route("/request-reset").post(requestPasswordReset);
router.route("/validate-reset-token").post(validateResetToken);
router.route("/reset-password").post(resetPassword);
router.route("/verify-email/:token").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);

router.get("/mej", protectJwtUser, getMe);
router.get("/me", protect, getMe);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router
  .route("/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      (req as any).token = generateToken({
        id: (req.user as any).id,
        email: (req.user as any).email,
      });

      const token = (req as any).token;
      req.user = req.user;
      const cookieOption = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        // sameSite: "Lax",
      };

      res.cookie("token", token, cookieOption);

      if (req.user && token) {
        res.redirect(
          `http://localhost:3000/token_verification/?token=${token}`
        );
      } else {
        res.status(400).json({
          message: "Authentication failed",
        });
      }
    }
  );

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

export default router;
