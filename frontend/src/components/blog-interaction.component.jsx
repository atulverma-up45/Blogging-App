import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/context";
import toast from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog: {
      _id,
      blog_id,
      title,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    blog,
    setCommentsWrapper,
  } = useContext(BlogContext);

  const { userAuth } = useContext(UserContext);

  const username = userAuth?.user?.username;
  const accessToken = userAuth.accessToken;

  useEffect(() => {
    if (accessToken) {
      // make request to server to get like information
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
          { _id },
          {
            headers: {
              "x-accessToken": `${accessToken}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setIsLikedByUser(Boolean(result));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  // console.log("UserAuth", accessToken);

  const handleLike = () => {
    if (accessToken) {
      // like the blog
      setIsLikedByUser((preVal) => !preVal);

      !isLikedByUser ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
          {
            blog_id: _id,
            islikedByUser: isLikedByUser,
          },
          {
            headers: {
              "x-accessToken": `${accessToken}`,
            },
          }
        )
        .then(({ data }) => {
          // console.log("liked data", data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      toast.error("Please Login to Like the Blog");
    }
  };

  return (
    <>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            onClick={handleLike}
            className={
              "w-10 h-10 rounded-full flex items-center justify-center " +
              (isLikedByUser ? " bg-red/20 text-red" : "bg-grey/80")
            }
          >
            <i
              className={
                "fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")
              }
            ></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>
          <button
            onClick={() => setCommentsWrapper((preVal) => !preVal)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
          >
            <i className="fi fi-rr-comment-dots"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          ) : (
            " "
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=${title}&url=${location.href}`}
            target="_blank"
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
