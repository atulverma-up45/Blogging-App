import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      use_filename: true,
      folder: "BloggingApp",
      resource_type: "auto",
    });

    // Remove the locally saved temporary file
    await fs.unlink(localFilePath);

    return response;
  } catch (error) {
    // Log or handle the error appropriately
    console.error("Upload to Cloudinary failed:", error);

    return null;
  }
};

export { uploadOnCloudinary };
