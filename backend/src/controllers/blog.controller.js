import { nanoid } from "nanoid";
import Blog from "../models/blog.models.js";
import User from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Notification from "../models/notification.models.js";
import Comment from "../models/comment.models.js";

export const createBlogController = async (req, res) => {
  // Fetch the data from req body
  const userId = req.user.id;
  let { title, des, banner, tags, content, draft, id } = req.body;

  try {
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
    const blogId =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() +
        "-" +
        nanoid();

    if (id) {
      await Blog.findOneAndUpdate(
        { blog_id: blogId },
        { title, des, banner, tags, content, draft: draft ? draft : false }
      );

      return res.status(201).json({
        success: true,
        message: "Blogpost Updated Successfully",
      });
    } else {
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
    }
  } catch (error) {
    console.error("Error saving/updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while publishing/updating the blog",
    });
  }
};

export const fileUploadController = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required for uploading.",
      });
    }

    const fileLocalPath = req.file?.path;

    const response = await uploadOnCloudinary(fileLocalPath);

    return res.status(201).json({
      success: true,
      message: "File Uploaded Successfully",
      fileURL: response.secure_url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file.",
    });
  }
};

export const latestBlogsController = async (req, res) => {
  try {
    const { page } = req.body;

    const maxLimit = 3;
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.username personal_info.avatar  personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id  ")
      .skip((page - 1) * maxLimit)
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
    const { tag, page, query, author, limit, eliminate_blog } = req.body;
    let findQuery;
    if (tag) {
      findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
      const regexQuery = new RegExp(`\\b${query}\\b`, "i");
      findQuery = { draft: false, title: regexQuery };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    const maxLimit = limit || 2;

    const searchblogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.username personal_info.avatar personal_info.firstName personal_info.lastName -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({
      success: true,
      message: `Blogs post with '${tag ? tag : query}' fetched successfully`,
      blogs: searchblogs,
    });
  } catch (error) {
    console.log("Error occurred while fetching the search blogs post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const allLatestBlogsCount = async (req, res) => {
  await Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({
        success: true,
        totalDocs: count,
        message: "All Latest Blogs Counts fetch successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    });
};

export const searchBlogsCount = async (req, res) => {
  const { tag, query, author } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    const regexQuery = new RegExp(`\\b${query}\\b`, "i");
    findQuery = { draft: false, title: regexQuery };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  await Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({
        totalDocs: count,
      });
    })
    .catch((err) => {
      console.log("Error is SearchBlogs Count :", err.message);
      return res.status(500).json({
        success: true,
        message: "Internal Server Error",
        error: err.message,
      });
    });
};

export const searchUsersController = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "query is required for Search User",
      });
    }

    const user = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(50)
      .select(
        "personal_info.username personal_info.firstName personal_info.lastName personal_info.avatar -_id"
      );

    return res.status(200).json({
      success: true,
      message: `user with ${query} UserName fetched Successfully `,
      users: user,
    });
  } catch (error) {
    console.log(
      "error occurd while fetching the users in searchUsersController",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getProfileController = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username && !username.length) {
      return res.status(400).json({
        success: false,
        message: "Username is required for getting the profile",
      });
    }

    const userProfile = await User.findOne({
      "personal_info.username": username,
    }).select(
      "-personal_info.password -updatedAt -blogs -google_auth -accountType -refreshToken"
    );

    return res.status(200).json({
      success: true,
      message: "User Profile Fetched Successfully",
      user: userProfile,
    });
  } catch (error) {
    console.log("Error Occurrd while fetching the User Profile", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBlogController = async (req, res) => {
  try {
    // retrieve the blog id
    const { blog_id, draft, mode } = req.body;

    // validate the data
    if (!blog_id || !blog_id.length) {
      return res.status(400).json({
        success: false,
        message: "Blog Id is Required for fetched the blogs",
      });
    }

    let incrementVal = mode !== "edit" ? 1 : 0;

    // find and update the blog
    const blogDetails = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } }
    )
      .populate(
        "author",
        "personal_info.firstName personal_info.lastName personal_info.username personal_info.avatar"
      )
      .select("title des content banner activity publishedAt blog_id tags");

    // console.log("blog", blogDetails);

    // find the user and update the reads count
    try {
      await User.findOneAndUpdate(
        { "personal_info.username": blogDetails.author.personal_info.username },
        {
          $inc: { "account_info.total_reads": incrementVal },
        }
      );
    } catch (error) {
      console.log("error occur while updating the user total reads count");
    }

    if (blogDetails.draft && !draft) {
      return res.status(500).json({
        success: false,
        message: "you can not access the draft blogs",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Blog Fetched Successfully",
      blogDetails,
    });
  } catch (error) {
    console.log(
      "Error Occurred While fetching the Blog in getBlogController:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const likeBlogController = async (req, res) => {
  try {
    // destructure the data from user req
    const user_id = req.user?._id;

    const { blog_id, islikedByUser } = req.body;

    if (!blog_id || !blog_id.length) {
      return res.status(400).json({
        success: false,
        message: "Blog_ID is Required",
      });
    }

    let incrementVal = !islikedByUser ? 1 : -1;

    const blog = await Blog.findOneAndUpdate(
      { _id: blog_id },
      { $inc: { "activity.total_likes": incrementVal } }
    );

    if (!islikedByUser) {
      const like = new Notification({
        type: "like",
        blog: blog_id,
        notification_for: blog.author,
        user: user_id,
      });

      await like.save();

      return res.status(201).json({
        success: true,
        message: "Post is Like by the User",
        liked_by_user: true,
      });
    } else {
      await Notification.findOneAndDelete({
        user: user_id,
        blog: blog_id,
        type: "like",
      });
      return res.status(201).json({
        success: true,
        liked_by_user: false,
        message: "Post is Disliked By the User",
      });
    }
  } catch (error) {
    console.log("Error Occurred when Like the blog", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const isLikedByUserController = async (req, res) => {
  try {
    // destructure the data from req
    const user_id = req.user._id;
    const { _id } = req.body;
    const result = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({
      success: true,
      message: "Is Liked By User fetched Successfully",
      result,
    });
  } catch (error) {
    console.log(
      "Error Occurred while fetchig the isLiked By user",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addCommentController = async (req, res) => {
  // destructure the data from request
  const user_id = req.user._id;
  const { blog_id, comment, blog_author, replying_to, notification_id } =
    req.body;

  if (!comment || !comment.length) {
    return res.status(400).json({
      success: false,
      message: "Comments Are Required",
    });
  }

  // creating a comment object
  const commentObj = {
    blog_id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  const commentFile = await new Comment(commentObj).save();

  const { commentedAt, children } = commentFile;

  const blog = await Blog.findOneAndUpdate(
    { _id: blog_id },
    {
      $push: { comments: commentFile._id },
      $inc: {
        "activity.total_comments": 1,
        "activity.total_parent_comments": replying_to ? 0 : 1,
      },
    }
  );

  // console.log("New comment created", blog);

  const notificationObj = {
    type: replying_to ? "reply" : "comment",
    blog: blog_id,
    notification_for: blog_author,
    user: user_id,
    comment: commentFile._id,
  };

  if (replying_to) {
    notificationObj.replied_on_comment = replying_to;
    const replyingToCommentDoc = await Comment.findOneAndUpdate(
      { _id: replying_to },
      { $push: { children: commentFile._id } }
    );

    notificationObj.notification_for = replyingToCommentDoc.commented_by;
    if (notification_id) {
      Notification.findOneAndUpdate(
        { _id: notification_id },
        { reply: commentFile._id }
      ).then((notification) => {
        console.log("Notification Updated");
      });
    }
  }

  new Notification(notificationObj)
    .save()
    .then((notification) => console.log("new Notification", notification));

  return res.status(201).json({
    success: true,
    message: "User Commented Successfully",
    comment,
    commentedAt,
    _id: commentFile._id,
    user_id,
    children,
  });
};

export const getBlogCommentsController = async (req, res) => {
  try {
    // destructure the data from req
    const { blog_id, skip } = req.body;

    if (!blog_id) {
      return res.status(400).json({
        success: false,
        message: "blog_id is Required",
      });
    }

    // if (!skip) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "skip is Required",
    //   });
    // }

    const maxLimit = 5;

    const comments = await Comment.find({ blog_id: blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.firstName personal_info.lastName personal_info.avatar"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Blog Comments Fetch successfully",
      comments: comments,
    });
  } catch (error) {
    console.error(
      "Error Occurred while fetching the Comments: getBlogCommentsControllers",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getRepliesController = async (req, res) => {
  try {
    // destracture the data from req body
    const { _id, skip } = req.body;

    let maxLimit = 5;

    const repliesDoc = await Comment.findOne({ _id })
      .populate({
        path: "children",
        option: {
          limit: maxLimit,
          skip: skip,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select:
            "personal_info.avatar personal_info.firstName personal_info.lastName personal_info.username",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");

    return res.status(200).json({
      success: true,
      message: "All Replies fetch Successfully",
      replies: repliesDoc.children,
    });
  } catch (error) {
    console.log(
      "Error Occured while Fetching the All Replies : getRepliesController",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// delete comment function
const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id }).then((comment) => {
    if (comment.parent) {
      Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      )
        .then((data) => {
          console.log("Comment Delete From Parent");
        })
        .catch((error) => {
          console.log(
            "Error Occurred While deleting the Parents Comments",
            error
          );
        });
    }
    Notification.findOneAndDelete({ comment: _id })
      .then((data) => {
        console.log("comment Notification Deleted");
      })
      .catch((error) => {
        console.log("Error Occurred while deleting the notifications", error);
      });

    Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } })
      .then((data) => {
        console.log("Reply deleted ");
      })
      .catch((error) => {
        console.log("Error Occurred while deleting the notifications", error);
      });

    Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        },
      }
    ).then((blog) => {
      if (comment.children.length) {
        comment.children.map((replies) => {
          deleteComments(replies);
        });
      }
    });
  });
};

export const deleteCommentController = (req, res) => {
  try {
    // destructure the comment from the req
    const user_id = req.user._id.toString();
    const { _id } = req.body;

    Comment.findOne({ _id: _id }).then((comment) => {
      if (!comment) {
        return res.status(400).json({
          success: false,
          message: "Please Enter a Valid  Comment ID",
        });
      }

      console.log(comment);

      if (user_id == comment.commented_by || user_id == comment.blog_author) {
        console.log("in function");
        deleteComments(_id);
        return res.status(200).json({
          success: true,
          message: "Comment is Deleted Successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "You Can not Delete this Comment",
        });
      }
    });
  } catch (error) {
    console.log(
      "Error Occur While Deleting the Comment : deleteCommentController",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const newNotificationController = async (req, res) => {
  // destracture the data from the req
  let user_id = req.user._id;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      // console.log("result", result);
      if (result) {
        return res.status(200).json({
          new_notification_available: true,
        });
      } else {
        return res.status(200).json({
          new_notification_available: false,
        });
      }
    })
    .catch((error) => {
      console.log(
        "Error Occurred while get the New Notification in : newNotificationController",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Internal server Error",
      });
    });
};

export const notificationsController = async (req, res) => {
  // destructure the data from request
  const user_id = req.user._id;

  const { page, filter, deletedDocCount } = req.body;
  const maxLimit = 10;

  const findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  let skipDocs = (page - 1) * maxLimit;

  if (filter != "all") {
    findQuery.type = filter;
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.firstName personal_info.lastName personal_info.username personal_info.avatar"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log("Notification seen");
        });

      return res.status(200).json({
        success: true,
        message: "notifications fetch successfully",
        notifications,
      });
    })
    .catch((error) => {
      console.log(
        "Error Occurred while fetching the notification : notificationsController",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    });
};

export const allNotificationsCount = async (req, res) => {
  // destructure the data from the request
  const user_id = req.user._id;

  const { filter } = req.body;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({
        totalDocs: count,
        success: true,
        message: "All Notification Count fetch successfully",
      });
    })
    .catch((error) => {
      console.log(
        "Error occured while fetch all notifications count : allNotificationsController",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    });
};

export const userWrittenBlogsController = (req, res) => {
  // destructure the data from the request
  const user_id = req.user._id;

  const { page, draft, query, deletedDocCount } = req.body;

  const maxLimit = 2;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" title banner publishedAt blog_id activity des draft -_id")
    .then((blogs) => {
      return res.status(200).json({
        success: true,
        message: "User Written Blogs fetched Successfully",
        blogs,
      });
    })
    .catch((error) => {
      console.log(
        "Error Occurred While fetching the User Written Blogs",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Internal Sever Error",
      });
    });
};

export const userWrittenBlogsCount = (req, res) => {
  // destructrue the data from the reques
  const user_id = req.user._id;

  const { draft, query } = req.body;

  Blog.countDocuments({
    author: user_id,
    draft,
    title: new RegExp(query, "i"),
  })
    .then((count) => {
      return res.status(200).json({
        success: true,
        message: "User Written Blogs Count fetch successfully",
        totalDocs: count,
      });
    })
    .catch((error) => {
      console.log(
        "Error Occurred While fetching the User Written Blogs Count",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Internal Sever Error",
      });
    });
};

export const deleteBlogController = (req, res) => {
  // destructure the data from the request
  const user_id = req.user._id;
  const { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) => {
        console.log("notification deleted");
      }).catch((error)=>{
        console.log("error occured while deleting notification", error.message);
      })

      Comment.deleteMany({ blog_id: blog._id }).then((data) => {
        console.log("comments deleted");
      }).catch((error)=>{
        console.log("error occured while deleting comment", error.message);
      })

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
      ).then((user) => {
        console.log("Blog deleted");
      });

      return res.status(200).json({
        success: true,
        message: "Blog Post Deleted Successfully",
      });
    })
    .catch((error) => {
      console.log("Error Occurred While deleting the Blog", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    });
};
