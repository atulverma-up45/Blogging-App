import { useContext, useState } from "react";
import { UserContext } from "../context/context";
import toast from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
}) => {
  const { blog, setBlog, setTotalParentCommentsLoaded } =
    useContext(BlogContext);
  const {
    _id,
    comments,
    comments: { results: commentArr },
    activity: { total_comments, total_parent_comments },
    author: { _id: blog_author },
  } = blog;

  const {
    userAuth,
    userAuth: { accessToken },
  } = useContext(UserContext);

  const firstName = userAuth?.user?.firstName;
  const lastName = userAuth?.user?.lastName;
  const username = userAuth?.user?.username;
  const avatar = userAuth?.user?.avatar;

  const [comment, setComment] = useState("");

  const handleComment = () => {
    if (!accessToken) {
      return toast.error("Login first to Leave a Comment");
    }

    if (!comment.length) {
      return toast.error("Write something to Leave comment");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          blog_id: _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: {
            "x-accessToken": `${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        // console.log(data);
        setComment("");
        data.commented_by = {
          personal_info: { username, avatar, firstName, lastName },
        };

        let newCommentArr;

        if (replyingTo) {
          commentArr[index].children.push(data._id);
          data.childrenLevel = commentArr[index].childrenLevel + 1;
          data.parentIndex = index;
          commentArr[index].isReplyLoaded = true;
          commentArr.splice(index + 1, 0, data);
          newCommentArr = commentArr;
          setReplying = false
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;

        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...blog.activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}{" "}
      </button>
    </>
  );
};

export default CommentField;
