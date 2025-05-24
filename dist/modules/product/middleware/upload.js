"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../../shared/config/cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        const extension = file.mimetype.split("/")[1];
        const allowedFormats = ["jpg", "png", "jpeg", "webp"];
        console.log("Received file from Upload:", file.originalname);
        if (allowedFormats.includes(extension)) {
            return {
                folder: "ecommerce-products",
                format: extension,
                public_id: `image_${Date.now()}`,
                resource_type: "image",
                timeout: 60000,
                // transformation: [{ width: 500, height: 400, crop: "limit" }],
            };
        }
        else {
            throw new Error("Invalid file format");
        }
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    // limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5);
exports.default = upload;
