import { body } from "express-validator";

export const validUserSignInput = [
  body("name").notEmpty().isString().withMessage("Name is required"),
  body("email").notEmpty().isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters"),
];
