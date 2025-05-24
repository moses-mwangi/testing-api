"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validUserSignInput = void 0;
const express_validator_1 = require("express-validator");
exports.validUserSignInput = [
    (0, express_validator_1.body)("name").notEmpty().isString().withMessage("Name is required"),
    (0, express_validator_1.body)("email").notEmpty().isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be atleast 6 characters"),
];
