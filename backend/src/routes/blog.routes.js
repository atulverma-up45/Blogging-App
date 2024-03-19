import {
  createBlogController,
  fileUploadController,
  latestBlogsController,
  searchBlogsController,
  trendingBlogsConroller,
} from "../controllers/blog.controller.js";
import {
  authenticate,
  isUser,
  isAdmin,
} from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

import express from "express";

const blogRoutes = express.Router();

blogRoutes.route("/create-blog").post(authenticate, createBlogController);
blogRoutes
  .route("/file-upload")
  .post(authenticate, upload.single("file"), fileUploadController);
blogRoutes.route("/latest-blogs").get(latestBlogsController);
blogRoutes.route("/trending-blogs").get(trendingBlogsConroller);
blogRoutes.route("/search-blogs").post(searchBlogsController);

export default blogRoutes;
