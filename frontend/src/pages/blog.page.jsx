import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentContainer, {
  fetchComments,
} from "../components/comments.component";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: {
    personal_info: {},
  },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(async ({ data: { blogDetails } }) => {


        blogDetails.comments = await fetchComments({
          blog_id: blogDetails._id,
          setParentCommentCountFun: setTotalParentCommentsLoaded,
        });


      // console.log("totalParentCommentsLoaded blog", totalParentCommentsLoaded);

        setBlog(blogDetails);

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: blogDetails.tags[0], // Access tags from blogDetails
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
            // console.log("blog",data);
          })
          .catch((error) => {
            console.log("Error fetching similar blogs:", error);
          });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error Occurred while fetching the blog", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlog();
  }, [blog_id, ]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setIsLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  const {
    title,
    content,
    banner,
    author: {
      personal_info: { firstName, lastName, avatar, username: author_username },
    },
    publishedAt,
  } = blog;

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setIsLikedByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
          }}
        >
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <CommentContainer />
            <img
              src={banner}
              alt="title"
              className="aspect-video"
              loading="lazy"
            />
            <div className="mt-10">
              <h2>{title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={avatar}
                    alt={`${firstName} ${lastName}`}
                  />
                  <p className="capitalize">
                    {`${firstName} ${lastName}`}
                    <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published On {getDay(publishedAt)}
                </p>
              </div>
            </div>
            <BlogInteraction />

            {content.length > 0 && content[0].blocks ? (
              <div className="my-12 font-gelasio blog-page-content ">
                {content[0].blocks.map((block, i) => {
                  return (
                    <div key={i} className="my-4 md:my-8">
                      <BlogContent block={block} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No content available</p>
            )}

            <BlogInteraction />

            {similarBlogs !== null && similarBlogs.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar blogs
                </h1>

                {similarBlogs.map((blog, i) => {
                  const {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              " "
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
