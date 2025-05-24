import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { validationResult } from "express-validator";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import catchAsync from "../../../shared/utils/catchSync";
import User from "../models/userMode";
import { generateToken } from "../utils/jwt";
import AppError from "../../../shared/utils/AppError";
import { sendEmail } from "../utils/email";
import { Op } from "sequelize";

export const signInUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        errors: errors.array().map((err) => ({
          field: (err as any).param,
          message: err.msg,
        })),
      });
    }

    const { email, name, password, tradeRole, telephone, country } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email.toLowerCase() }],
        // emailVerified: true,
      },
    });

    if (existingUser) {
      return next(
        new AppError(
          "Account already exists with this email or phone number",
          409
        )
      );
    }

    if (password.length < 6) {
      return next(
        new AppError("Password must be at least 6 characters long", 400)
      );
    }

    // if (!user.emailVerified) {
    //   return res.status(403).json({
    //     status: "fail",
    //     message: "Your email is not verified. Please check your email.",
    //   });
    // }

    const newUser = await User.create({
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash: password,
      tradeRole: tradeRole?.trim() || null,
      telephone: telephone?.trim() || null,
      country: country?.trim() || null,
      emailVerified: false,
      lastLogin: new Date(),
    });

    const accessToken = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    const refreshToken = generateToken(
      { id: newUser.id, email: newUser.email },
      "90d"
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 90 * 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("jwt", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      path: "/api/auth/refresh",
    });

    if (req.session) {
      (req.session as any).userId = newUser.id;
    }

    // try {
    await sendEmail({
      email: newUser.email,
      subject: "Welcome! Verify your email",
      html: `
          <h1>Welcome to Hypermart Ecommerce!</h1>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${process.env.FRONTEND_URL}/registration/verify-email?token=${accessToken}"
             style="padding: 12px 24px; background: #4F46E5; color: white;
                    text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
        `,
    });
    // } catch (error) {
    //   console.error("Failed to send verification email:", error);
    //   return next(new AppError("Failed to send verification email", 500));
    // }

    res.status(201).json({
      status: "success",
      message: "Account created successfully",

      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        tradeRole: newUser.tradeRole,
        country: newUser.country,
        emailVerified: newUser.emailVerified,
      },
      token: accessToken,
      session: (req.session as any).userId,
    });

    (req as any).user = newUser;
    (req as any).verifyToken = accessToken;
  }
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    // try {
    const decoded = jwt.verify(
      token,
      String(process.env.JWT_SECRET_KEY)
    ) as JwtPayload;

    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "User not found",
      });
    }

    await user.update({ emailVerified: true });

    return res.json({ msg: "succesfully" });
  }
);

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(202)
        .json({ msg: "Please provide an email and password to log in" });
    }

    const user = await User.findOne({
      where: {
        email: email,
        emailVerified: true,
      },
    });

    if (!user || !(await user?.comparePassword(password))) {
      return res.json({
        error: "No user with those credential has being found",
      });
    }

    const token = generateToken({ id: user.id, email: user.email });

    const cookieOption = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxAge: 90 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict" as const,
    };

    res.cookie("jwt", token, cookieOption);
    res.status(200).json({ msg: "User succesfully LogIn", token });

    (req as any).user = user;
  }
);

export const deleteCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      return next(new AppError("No user with those id found", 400));
    }

    const deletedAccount = await User.destroy({
      where: {
        email: user.email,
      },
    });

    res.status(201).json({
      msg: "Account have being deleted",
      deletedAccount,
    });
  }
);

const jwtVerify = (token: string, secret: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const protectJwtUser = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res
      .status(401)
      .json({ msg: "You are not logged in! Please log in to get access." });
  }

  const decoded: any = await jwtVerify(
    token,
    String(process.env.JWT_SECRET_KEY)
  );

  const currentUser = await User.findOne({ where: { id: decoded.id } });
  if (!currentUser) {
    res
      .status(401)
      .json({ msg: "The user belonging to this token no longer exists." });
  }

  (req as any).user = currentUser;

  next();
});

export const protect = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ msg: "You are not logged in! Please log in to get access." });
  }

  try {
    const decoded = jwt.verify(
      token,
      String(process.env.JWT_SECRET_KEY)
    ) as JwtPayload;

    const currentUser = await User.findOne({ where: { id: decoded.id } });
    if (!currentUser) {
      return res
        .status(401)
        .json({ msg: "The user belonging to this token no longer exists." });
    }

    (req as any).user = currentUser;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res
        .status(401)
        .json({ msg: "Your session has expired. Please log in again." });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ msg: "Invalid token. Please log in again." });
    } else {
      console.error("JWT Verification Error:", err);
      return res
        .status(500)
        .json({ msg: "An unexpected error occurred. Please try again later." });
    }
  }
});

export const getMe = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ status: "success", user });
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // const cookieOption = {
    //   expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   secure: process.env.NODE_ENV === "production",
    //   httpOnly: true,
    //   sameSite: "strict" as const,
    // };

    const cookieOption = {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
      maxAge: 8 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict" as const,
    };

    await user.update({ passwordHash: newPassword });

    const token = generateToken({ id: user.id, email: user.email });
    res.cookie("jwt", token, cookieOption);
    (req.session as any).userId = user.id;

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
      token,
    });
  }
);

export const requestPasswordReset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "There is no user with this email address",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({
      passwordResetToken,
      passwordResetExpires,
    });

    const resetURL = `${process.env.FRONTEND_URL}/registration/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request (valid for 10 minutes)",
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetURL}" style="
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          ">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 10 minutes.</p>
        `,
      });

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to email",
      });
    } catch (err) {
      await user.update({
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      return res.status(500).json({
        status: "error",
        message: "There was an error sending the email. Try again later.",
      });
    }
  }
);

export const validateResetToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          // ["$gt"]: new Date(),
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Token is valid",
    });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log("HashedToken:", hashedToken);

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          // ["$gt"]: new Date(),
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    await user.update({
      passwordHash: password,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    const newToken = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
      token: newToken,
    });
  }
);

export const resendVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // console.log(user);

      const token = generateToken({ id: user.id, email: user.email });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 90 * 24 * 60 * 60 * 1000,
      };

      res.cookie("jwt", token, cookieOptions);

      await sendEmail({
        email: user.email,
        subject: "Resend Email Verification",
        html: `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.FRONTEND_URL}/registration/verify-email?token=${token}"
           style="padding: 12px 24px; background: #4F46E5; color: white; 
                  text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
      `,
      });

      return res
        .status(200)
        .json({ message: "Verification email sent successfully!" });
    } catch (error) {
      console.error("Error resending email:", error);
      return res
        .status(500)
        .json({ message: "Failed to send verification email." });
    }
  }
);

export const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ message: "User ID and new password are required" });
    }

    if (newPassword.length < 6) {
      return next(new AppError("Password must be at least 8 characters", 400));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.passwordHash) {
      return next(
        new AppError("Password already exists for this account", 400)
      );
    }

    // user.passwordHash = newPassword;
    // await user.save();
    await user.update({ passwordHash: newPassword });

    const cookieOption = {
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
      maxAge: 8 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict" as const,
    };

    const token = generateToken({ id: user.id, email: user.email });
    res.cookie("jwt", token, cookieOption);
    (req.session as any).userId = user.id;

    res.status(200).json({
      message: "Password set successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.emailVerified,
      },
    });
  }
);
