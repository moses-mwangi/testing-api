"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const router = (0, express_1.Router)();
router.route("/").get(usersController_1.getAllUser);
router.route("/:id").patch(usersController_1.updateUser);
exports.default = router;
