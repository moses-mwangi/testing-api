"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPassword = exports.resendVerificationEmail = exports.resetPassword = exports.validateResetToken = exports.requestPasswordReset = exports.updatePassword = exports.getMe = exports.protect = exports.protectJwtUser = exports.deleteCurrentUser = exports.loginUser = exports.verifyEmail = exports.signInUser = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const userMode_1 = __importDefault(require("../models/userMode"));
const jwt_1 = require("../utils/jwt");
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const email_1 = require("../utils/email");
const sequelize_1 = require("sequelize");
exports.signInUser = (0, catchSync_1.default)(async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "fail",
            errors: errors.array().map((err) => ({
                field: err.param,
                message: err.msg,
            })),
        });
    }
    const { email, name, password, tradeRole, telephone, country } = req.body;
    const existingUser = await userMode_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [{ email: email.toLowerCase() }],
            // emailVerified: true,
        },
    });
    if (existingUser) {
        return next(new AppError_1.default("Account already exists with this email or phone number", 409));
    }
    if (password.length < 6) {
        return next(new AppError_1.default("Password must be at least 6 characters long", 400));
    }
    // if (!user.emailVerified) {
    //   return res.status(403).json({
    //     status: "fail",
    //     message: "Your email is not verified. Please check your email.",
    //   });
    // }
    const newUser = await userMode_1.default.create({
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash: password,
        tradeRole: tradeRole?.trim() || null,
        telephone: telephone?.trim() || null,
        country: country?.trim() || null,
        emailVerified: false,
        lastLogin: new Date(),
    });
    const accessToken = (0, jwt_1.generateToken)({
        id: newUser.id,
        email: newUser.email,
    });
    const refreshToken = (0, jwt_1.generateToken)({ id: newUser.id, email: newUser.email }, "90d");
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 90 * 24 * 60 * 60 * 1000,
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("jwt", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        path: "/api/auth/refresh",
    });
    if (req.session) {
        req.session.userId = newUser.id;
    }
    // try {
    await (0, email_1.sendEmail)({
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
        session: req.session.userId,
    });
    req.user = newUser;
    req.verifyToken = accessToken;
});
exports.verifyEmail = (0, catchSync_1.default)(async (req, res, next) => {
    const { token } = req.params;
    // try {
    const decoded = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET_KEY));
    const user = await userMode_1.default.findOne({ where: { id: decoded.id } });
    if (!user) {
        return res.status(400).json({
            status: "fail",
            message: "User not found",
        });
    }
    await user.update({ emailVerified: true });
    return res.json({ msg: "succesfully" });
});
exports.loginUser = (0, catchSync_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(202)
            .json({ msg: "Please provide an email and password to log in" });
    }
    const user = await userMode_1.default.findOne({
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
    const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    const cookieOption = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        maxAge: 90 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
    };
    res.cookie("jwt", token, cookieOption);
    res.status(200).json({ msg: "User succesfully LogIn", token });
    req.user = user;
});
exports.deleteCurrentUser = (0, catchSync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const user = await userMode_1.default.findOne({ where: { id } });
    if (!user) {
        return next(new AppError_1.default("No user with those id found", 400));
    }
    const deletedAccount = await userMode_1.default.destroy({
        where: {
            email: user.email,
        },
    });
    res.status(201).json({
        msg: "Account have being deleted",
        deletedAccount,
    });
});
const jwtVerify = (token, secret) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
};
exports.protectJwtUser = (0, catchSync_1.default)(async function (req, res, next) {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        res
            .status(401)
            .json({ msg: "You are not logged in! Please log in to get access." });
    }
    const decoded = await jwtVerify(token, String(process.env.JWT_SECRET_KEY));
    const currentUser = await userMode_1.default.findOne({ where: { id: decoded.id } });
    if (!currentUser) {
        res
            .status(401)
            .json({ msg: "The user belonging to this token no longer exists." });
    }
    req.user = currentUser;
    next();
});
exports.protect = (0, catchSync_1.default)(async function (req, res, next) {
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    else if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res
            .status(401)
            .json({ msg: "You are not logged in! Please log in to get access." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, String(process.env.JWT_SECRET_KEY));
        const currentUser = await userMode_1.default.findOne({ where: { id: decoded.id } });
        if (!currentUser) {
            return res
                .status(401)
                .json({ msg: "The user belonging to this token no longer exists." });
        }
        req.user = currentUser;
        return next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
            return res
                .status(401)
                .json({ msg: "Your session has expired. Please log in again." });
        }
        else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res
                .status(401)
                .json({ msg: "Invalid token. Please log in again." });
        }
        else {
            console.error("JWT Verification Error:", err);
            return res
                .status(500)
                .json({ msg: "An unexpected error occurred. Please try again later." });
        }
    }
});
exports.getMe = (0, catchSync_1.default)((req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ status: "success", user });
});
exports.updatePassword = (0, catchSync_1.default)(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await userMode_1.default.findOne({ where: { id: userId } });
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
        sameSite: "strict",
    };
    await user.update({ passwordHash: newPassword });
    const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    res.cookie("jwt", token, cookieOption);
    req.session.userId = user.id;
    res.status(200).json({
        status: "success",
        message: "Password updated successfully",
        token,
    });
});
exports.requestPasswordReset = (0, catchSync_1.default)(async (req, res, next) => {
    const { email } = req.body;
    const user = await userMode_1.default.findOne({ where: { email } });
    if (!user) {
        return res.status(404).json({
            status: "fail",
            message: "There is no user with this email address",
        });
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const passwordResetToken = crypto_1.default
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
        await (0, email_1.sendEmail)({
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
    }
    catch (err) {
        await user.update({
            passwordResetToken: null,
            passwordResetExpires: null,
        });
        return res.status(500).json({
            status: "error",
            message: "There was an error sending the email. Try again later.",
        });
    }
});
exports.validateResetToken = (0, catchSync_1.default)(async (req, res, next) => {
    const { token } = req.body;
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = await userMode_1.default.findOne({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                // ["$gt"]: new Date(),
                [sequelize_1.Op.gt]: new Date(),
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
});
exports.resetPassword = (0, catchSync_1.default)(async (req, res, next) => {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({
            status: "fail",
            message: "Passwords do not match",
        });
    }
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    console.log("HashedToken:", hashedToken);
    const user = await userMode_1.default.findOne({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                // ["$gt"]: new Date(),
                [sequelize_1.Op.gt]: new Date(),
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
    const newToken = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    res.status(200).json({
        status: "success",
        message: "Password has been reset successfully",
        token: newToken,
    });
});
exports.resendVerificationEmail = (0, catchSync_1.default)(async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await userMode_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.emailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }
        // console.log(user);
        const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 90 * 24 * 60 * 60 * 1000,
        };
        res.cookie("jwt", token, cookieOptions);
        await (0, email_1.sendEmail)({
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
    }
    catch (error) {
        console.error("Error resending email:", error);
        return res
            .status(500)
            .json({ message: "Failed to send verification email." });
    }
});
exports.setPassword = (0, catchSync_1.default)(async (req, res, next) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
        return res
            .status(400)
            .json({ message: "User ID and new password are required" });
    }
    if (newPassword.length < 6) {
        return next(new AppError_1.default("Password must be at least 8 characters", 400));
    }
    const user = await userMode_1.default.findByPk(userId);
    if (!user) {
        return next(new AppError_1.default("User not found", 404));
    }
    if (user.passwordHash) {
        return next(new AppError_1.default("Password already exists for this account", 400));
    }
    // user.passwordHash = newPassword;
    // await user.save();
    await user.update({ passwordHash: newPassword });
    const cookieOption = {
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
        maxAge: 8 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
    };
    const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    res.cookie("jwt", token, cookieOption);
    req.session.userId = user.id;
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
});
