"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const url = String(process.env.PG_DATABASE_URL);
const sequelize = new sequelize_1.Sequelize(url, {
    dialect: "postgres",
    logging: console.log,
});
exports.default = sequelize;
