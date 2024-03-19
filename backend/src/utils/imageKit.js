import ImageKit from "imagekit";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

export const uploadOnImageKit = (localFilePath, fileName) => {
  if (!localFilePath) {
    throw new Error("Local file path is missing");
  }

  return imagekit
    .upload({
      file: localFilePath,
      fileName: fileName,
      folder: "BlogginApp",
      tags: ["BloggingApp", "Developer Atul Verma", "Atul Verma"],
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    })
    .then((response) => {
      // Remove the locally saved temporary file
      return fs.unlink(localFilePath).then(() => response);
    })
    .catch((error) => {
      console.error("Error occurred while uploading image", error);
    });
};
