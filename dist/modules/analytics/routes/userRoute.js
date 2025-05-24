"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersCntroller_1 = require("../controllers/usersCntroller");
const router = (0, express_1.Router)();
router.route("/").get(usersCntroller_1.getAllUser);
exports.default = router;
