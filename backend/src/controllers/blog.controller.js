import { nanoid } from "nanoid";
import Blog from "../models/blog.models.js";
import User from "../models/user.models.js";
import { uploadOnImageKit } from "../utils/imageKit.js";

export const createBlogController = async (req, res) => {
  // fetch the data from req body
  const userId = req.user.id;
  let { title, des, banner, tags, content, draft } = req.body;

  if (!title.length) {
    return res.status(400).json({
      success: false,
      message: "Title is required for creating a blog post",
    });
  }
  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(400).json({
        success: false,
        message:
          "Description is required & Description length should be 200 characters or less",
      });
    }

    if (!banner.length) {
      return res.status(400).json({
        success: false,
        message:
          "Banner or Thumbnail is required for creating and publishing a blog post",
      });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Tags are required, maximum of 10 tags allowed",
      });
    }

    if (!content || !content.blocks || !content.blocks.length) {
      return res.status(400).json({
        success: false,
        message: "There must be some blog content to publish",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());
  const blogId = (
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() +
    "-" +
    nanoid()
  ).toLowerCase();

  const blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: userId,
    blog_id: blogId,
    draft: Boolean(draft),
  });

  try {
    await blog.save();

    const incrementVal = draft ? 0 : 1;
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { "account_info.total_posts": incrementVal },
        $push: { blogs: blog.id },
      }
    );

    return res.status(201).json({
      success: true,
      message: "The Blog is Published Successfully",
    });
  } catch (error) {
    console.error("Error saving blog:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while publishing the blog",
    });
  }
};

export const fileUploadController = async (req, res) => {
  try {
    // Fetch the file from body
    const file = req.file?.path;

    // Validate the file
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required for uploading.",
      });
    }

    const fileName = req.file?.filename;

    // Assuming uploadOnImageKit accepts both file path and filename
    const response = await uploadOnImageKit(file, fileName);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      fileURL: response.url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file.",
      error: error.message,
    });
  }
};

export const latestBlogsController = async (req, res) => {
  try {
    const maxLimit = 5;
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.username personal_info.avatar  personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id  ")
      .limit(maxLimit);

    return res.status(200).json({
      success: true,
      message: "Latest Blogs Fetch Successfully",
      blogs: blogs,
    });
  } catch (error) {
    console.log("error Occurred while fetching the Latest post :", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const trendingBlogsConroller = async (req, res) => {
  try {
    const maxLimit = 5;
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.username personal_info.avatar  personal_info.firstName personal_info.lastName -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id  ")
      .limit(maxLimit);

    return res.status(200).json({
      success: true,
      message: "Trending Blogs Fetch Successfully",
      blogs: blogs,
    });
  } catch (error) {
    console.log("error Occurred while fetching the trending post :", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const searchBlogsController = async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag) {
      return res.status(400).json({
        success: false,
        message: "Tag is required"
      })
    }

    const findQuery = { tags: tag, draft: false };

    const maxLimit = 5;
    const searchblogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.username personal_info.avatar  personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id  ")
      .limit(maxLimit);

    return res.status(200).json({
      success: true,
      message: ` Blogs post with '${tag}' Fetch Successfully`,
      blogs: searchblogs,
    });
  } catch (error) {
    console.log("error Occurred while fetching the search blogs post :", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
