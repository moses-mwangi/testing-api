import { NextFunction, Request, Response } from "express";

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ msg: "Getting all users" });
  } catch (err) {
    console.error(err);
  }
};
