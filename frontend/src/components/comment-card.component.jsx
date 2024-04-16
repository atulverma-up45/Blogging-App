import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../context/context";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentCard = ({ index, leftVal, commentData }) => {
  const [isReplying, setIsReplying] = useState(false);
  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch (error) {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const {
    commented_by: {
      personal_info: {
        firstName,
        lastName,
        avatar,
        username: commented_by_username,
      },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  const {
    blog,
    setBlog,
    setTotalParentCommentsLoaded,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
  } = useContext(BlogContext);

  const {
    userAuth,
    userAuth: { accessToken },
  } = useContext(UserContext);

  const username = userAuth?.user?.username;

  const removeCommentsCard = (startingPoint, isDelete = false) => {
    const updatedCommentsArr = commentsArr.filter(
      (comment, i) =>
        i < startingPoint || comment.childrenLevel <= commentData.childrenLevel
    );

    if (isDelete) {
      const parentIndex = getParentIndex();

      if (parentIndex != undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child != _id);
        if (commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }
    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: updatedCommentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCard(index + 1);
  };

  const loadReplies = ({ skip = 0 }) => {
    if (children.length) {
      hideReplies();
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentData.isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.children + 1;
            commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleReplyClick = () => {
    if (!accessToken) {
      return toast.error("Login first to leave a Reply");
    }

    setIsReplying((prev) => !prev);
  };

  const deleteComment = (event) => {
    event.target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        {
          _id,
        },
        {
          headers: {
            "x-accessToken": `${accessToken}`,
          },
        }
      )
      .then(() => {
        event.target.removeAttribute("disabled");
        removeCommentsCard(index + 1, true);
        toast.success("Comment Deleted Successfully")
      })
      .catch((error) => {
        console.log(error);
        toast.error("Comment is Not Deleted Successfully")
      });
  };

  return (
    <div className="w-full " style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img
            src={avatar}
            alt={firstName + " " + lastName}
            className="w-6 h-6 rounded-full "
          />
          <p className="line-clamp-1">
            {`${firstName} @${commented_by_username}`}{" "}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex gap-5 items-center mt-5 font-gelasio">
          {commentData.isReplyLoaded ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={hideReplies}
            >
              <i className="fi fi-rs-comment-dots"></i> Hide Reply
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={loadReplies}
            >
              <i className="fi fi-rs-comment-dots"></i> {children.length} Reply
            </button>
          )}
          <button className="underline " onClick={handleReplyClick}>
            Reply
          </button>
          {username == commented_by_username || username == blog_author ? (
            <button
              onClick={deleteComment}
              className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center "
            >
              <i className="fi fi-rr-trash pointer-events-none"></i>
            </button>
          ) : (
            ""
          )}
        </div>
        {isReplying ? (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setReplying={setIsReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CommentCard;
