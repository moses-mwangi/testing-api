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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = exports.productRouter = void 0;
var productsRoute_1 = require("../product/routes/productsRoute");
Object.defineProperty(exports, "productRouter", { enumerable: true, get: function () { return __importDefault(productsRoute_1).default; } });
var categoryRoute_1 = require("../product/routes/categoryRoute");
Object.defineProperty(exports, "categoryRouter", { enumerable: true, get: function () { return __importDefault(categoryRoute_1).default; } });
__exportStar(require("../product/controllers/productController"), exports);
__exportStar(require("../product/controllers/categoryController"), exports);
