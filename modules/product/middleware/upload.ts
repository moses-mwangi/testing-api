import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../shared/config/cloudinary";
import dotenv from "dotenv";

dotenv.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
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
    } else {
      throw new Error("Invalid file format");
    }
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 5);

export default upload;
