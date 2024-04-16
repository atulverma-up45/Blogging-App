import {
  addCommentController,
  allLatestBlogsCount,
  allNotificationsCount,
  createBlogController,
  deleteBlogController,
  deleteCommentController,
  fileUploadController,
  getBlogCommentsController,
  getBlogController,
  getProfileController,
  getRepliesController,
  isLikedByUserController,
  latestBlogsController,
  likeBlogController,
  newNotificationController,
  notificationsController,
  searchBlogsController,
  searchBlogsCount,
  searchUsersController,
  trendingBlogsConroller,
  userWrittenBlogsController,
  userWrittenBlogsCount,
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
blogRoutes.route("/latest-blogs").post(latestBlogsController);
blogRoutes.route("/trending-blogs").get(trendingBlogsConroller);
blogRoutes.route("/search-blogs").post(searchBlogsController);
blogRoutes.route("/all-latest-blogs-count").post(allLatestBlogsCount);
blogRoutes.route("/search-blogs-count").post(searchBlogsCount);
blogRoutes.route("/search-users").post(searchUsersController);
blogRoutes.route("/get-profile").post(getProfileController);
blogRoutes.route("/get-blog").post(getBlogController);
blogRoutes.route("/like-blog").post(authenticate, likeBlogController);
blogRoutes
  .route("/isliked-by-user")
  .post(authenticate, authenticate, isLikedByUserController);
blogRoutes.route("/add-comment").post(authenticate, addCommentController);
blogRoutes.route("/get-blog-comments").post(getBlogCommentsController);
blogRoutes.route("/get-replies").post(getRepliesController);
blogRoutes.route("/delete-comment").post(authenticate, deleteCommentController);
blogRoutes
  .route("/new-notification")
  .get(authenticate, newNotificationController);
blogRoutes.route("/notifications").post(authenticate, notificationsController);
blogRoutes
  .route("/all-notifications-count")
  .post(authenticate, allNotificationsCount);

blogRoutes
  .route("/user-written-blogs")
  .post(authenticate, userWrittenBlogsController);

blogRoutes
  .route("/user-written-blogs-count")
  .post(authenticate, userWrittenBlogsCount);

blogRoutes.route("/delete-blog").post(authenticate, deleteBlogController);
export default blogRoutes;
