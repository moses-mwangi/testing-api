"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUser = void 0;
const getAllUser = async (req, res, next) => {
    try {
        res.json({ msg: "Getting all users" });
    }
    catch (err) {
        console.error(err);
    }
};
exports.getAllUser = getAllUser;
