"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackPayments = exports.payments = void 0;
var paymentRoutes_1 = require("./routes/paymentRoutes");
Object.defineProperty(exports, "payments", { enumerable: true, get: function () { return __importDefault(paymentRoutes_1).default; } });
var paymentPaystackRoutes_1 = require("./routes/paymentPaystackRoutes");
Object.defineProperty(exports, "paystackPayments", { enumerable: true, get: function () { return __importDefault(paymentPaystackRoutes_1).default; } });
// export * from './controllers/userController';
// export * from './services/userService';
// export * from './models/userModel';
// export * from './routes/userRoutes';
// export * from './middlewares/userAuthMiddleware';
// export * from './validations/userValidation';
// export * from './dtos/userDTO';
