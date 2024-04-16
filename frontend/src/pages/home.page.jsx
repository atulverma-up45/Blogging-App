import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlog, setTrendingBlog] = useState(null);
  const [pageState, setPageState] = useState("home");
  const [loading, setLoading] = useState(false);

  const categories = [
    "mern stack",
    "programming",
    "nodejs",
    "reactjs",
    "expressjs",
    "mongodb",
  ];
  const fetchLatestBlogs = ({ page = 1 }) => {
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`, {
        page: page,
      })
      .then(async ({ data }) => {
        // console.log("Received data from server:", data);
        // console.log("Received blogs:", data.blogs);

        try {
          const formatedData = await filterPaginationData({
            state: blogs, // Make sure `blogs` is defined and accessible here
            data: data.blogs,
            page,
            countRoute: "/all-latest-blogs-count",
          });

          // console.log("Formatted data:", formatedData);
          setBlogs(formatedData);
        } catch (error) {
          console.error("Error while formatting data:", error);
        }
      })
      .catch((err) => {
        console.error("Error while fetching latest blogs:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchTrendingBlogs = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`)
      .then(({ data }) => {
        setTrendingBlog(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingBlog) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  const loadBlogByCategory = (event) => {
    const category = event.target.innerText.toLowerCase();
    setBlogs(null);
    setTrendingBlog(null);
    setPageState(category === pageState ? "home" : category);
    if (category !== "trending blogs") {
      fetchTrendingBlogs();
    }
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        // console.log("Formatted data:", formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {loading ? (
                <Loader />
              ) : blogs === null || blogs.results.length === 0 ? (
                <NoDataMessage message="No Blog Published" />
              ) : (
                blogs.results.map((blog, index) => (
                  <AnimationWrapper
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                ))
              )}
              <LoadMoreDataBtn
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
                state={blogs}
              />
            </>
            {loading ? (
              <Loader />
            ) : trendingBlog === null || trendingBlog.length === 0 ? (
              <NoDataMessage message="No Trending blogs found." />
            ) : (
              trendingBlog.map((blog, index) => (
                <AnimationWrapper
                  key={index}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <MinimalBlogPost blog={blog} index={index} />
                </AnimationWrapper>
              ))
            )}
          </InPageNavigation>
        </div>
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-2 border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, index) => (
                  <button
                    onClick={loadBlogByCategory}
                    className={`tag ${
                      pageState === category && "bg-black text-white"
                    }`}
                    key={index}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-medium text-xl mb-8 mt-4">
              Trending <i className="fi fi-rr-arrow-trend-up"></i>
            </h1>
            {loading ? (
              <Loader />
            ) : trendingBlog === null || trendingBlog.length === 0 ? (
              <NoDataMessage message="No Trending blogs found." />
            ) : (
              trendingBlog.map((blog, index) => (
                <AnimationWrapper
                  key={index}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <MinimalBlogPost blog={blog} index={index} />
                </AnimationWrapper>
              ))
            )}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
