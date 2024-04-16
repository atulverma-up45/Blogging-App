import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../context/context";
import axios from "axios";
import toast from "react-hot-toast";

const NotificationCard = ({ data, index, notificationState }) => {
  const [isReplying, setIsReplying] = useState(false);

  const {
    setNotifications,
    notifications,
    notifications: { results, totalDocs },
  } = notificationState;

  const {
    seen,
    type,
    reply,
    replied_on_comment,
    user,
    user: {
      personal_info: { avatar, firstName, lastName, username },
    },
    blog: { _id, blog_id, title },
    comment,
    createdAt,
    _id: notification_id,
  } = data;

  const {
    userAuth: {
      accessToken,
      user: { avatar: author_profile_img, username: author_username },
    },
  } = useContext(UserContext);

  const handleReplyClick = () => {
    setIsReplying((preVal) => !preVal);
  };

  const handleDelete = (comment_id, type, target) => {
    target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id: comment_id },
        {
          headers: {
            "X-accessToken": accessToken,
          },
        }
      )
      .then(() => {
        if (type === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }
        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
        toast.success("comment deleted 👍 ")
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //  console.log(reply);
  return (
    <div className={"p-6 border-b border-grey border-l-black "  + (!seen ? " border-l-2 " : "")}>
      <div className="flex gap-5 mb-3">
        <img
          className="w-14 h-14 flex-none rounded-full"
          src={avatar}
          alt={`${firstName} ${lastName}`}
        />
        <div className="w-full ">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="lg:inline-block hidden capitalize">{`${firstName} ${lastName}`}</span>
            <Link
              to={`/user/${username}`}
              className="mx-1 text-black underline"
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type === "like"
                ? "Liked your Blog"
                : type === "comment"
                ? "Commented On"
                : "Replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className="font-medium text-dark-grey hover:underline line-clamp-1"
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>
      {type !== "like" ? (
        <p className="ml-14 pl-5 font-gelasio text-xl my-5">
          {comment.comment}
        </p>
      ) : (
        ""
      )}

      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
        <p>{getDay(createdAt)}</p>
        {type != "like" ? (
          <>
            {!reply ? (
              <button
                className="underline hover:text-black"
                onClick={handleReplyClick}
              >
                Reply
              </button>
            ) : (
              " "
            )}
            <button
              onClick={(e) => {
                handleDelete(comment._id, "comment", e.target);
              }}
              className="underline hover:text-black"
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>

      {isReplying ? (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      ) : (
        " "
      )}

      {reply ? (
        <div className="ml-20 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            <img src={author_profile_img} className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="font-medium text-xl text-dark-grey ">
                <Link
                  className="text-black underline mx-1"
                  to={`/user/${author_username}`}
                >
                  @{author_username}{" "}
                </Link>
                <span className="font-normal">replied to</span>
                <Link
                  className="text-black underline mx-1"
                  to={`/user/${username}`}
                >
                  @{username}{" "}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
          <button
            onClick={(e) => {
              handleDelete(reply._id, "reply", e.target);
            }}
            className="underline hover:text-black ml-14 mt-2"
          >
            Delete
          </button>
        </div>
      ) : (
        " "
      )}
    </div>
  );
};

export default NotificationCard;
