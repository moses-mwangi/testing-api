"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getAllUser = void 0;
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const userMode_1 = __importDefault(require("../models/userMode"));
const express_validator_1 = require("express-validator");
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const jwt_1 = require("../utils/jwt");
const validUserSignInput = [
    (0, express_validator_1.body)("name").notEmpty().isString().withMessage("Name is required"),
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("passwordHash")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be atleast 6 characters"),
];
exports.getAllUser = (0, catchSync_1.default)(async (req, res, next) => {
    const users = await userMode_1.default.findAll({ where: { emailVerified: true } });
    if (!users) {
        return next(new AppError_1.default("No user found", 404));
    }
    res.status(200).json({
        length: users.length,
        msg: "users succesfully fetched",
        users,
    });
});
exports.updateUser = (0, catchSync_1.default)(async (req, res, next) => {
    const id = req.params.id;
    const { email, passwordHash, ...updates } = req.body;
    if (email) {
        return next(new AppError_1.default("You can't update Email", 400));
    }
    if (Object.keys(updates).length === 0) {
        return next(new AppError_1.default("Nothing to update", 400));
    }
    const user = await userMode_1.default.findOne({ where: { id } });
    if (!user) {
        return next(new AppError_1.default("No user with that Id", 404));
    }
    const updatedUser = await user.update(updates);
    const token = (0, jwt_1.generateToken)({
        id: updatedUser.id,
        email: updatedUser.email,
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    res.status(200).json({
        message: "User successfully updated",
        updatedUser,
        token,
    });
});
