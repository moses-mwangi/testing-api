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
exports.authRouter = exports.userRouter = void 0;
var userRoute_1 = require("../users/routes/userRoute");
Object.defineProperty(exports, "userRouter", { enumerable: true, get: function () { return __importDefault(userRoute_1).default; } });
var authRoute_1 = require("../users/routes/authRoute");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return __importDefault(authRoute_1).default; } });
__exportStar(require("./controllers/usersController"), exports);
// export * from './controllers/userController';
// export * from './services/userService';
// export * from './models/userModel';
// export * from './routes/userRoutes';
// export * from './middlewares/userAuthMiddleware';
// export * from './validations/userValidation';
// export * from './dtos/userDTO';
