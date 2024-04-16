import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/context";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManageDraftBlogPost,
  ManagePublishedBlogsCard,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";

const ManageBlogs = () => {
  const {
    userAuth,
    userAuth: { accessToken },
  } = useContext(UserContext);

  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
        {
          page,
          draft,
          query,
          deletedDocCount,
        },
        {
          headers: {
            "X-accessToken": accessToken,
          },
        }
      )
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: accessToken,
          countRoute: "/user-written-blogs-count",
          data_to_send: { draft, query },
        });

        console.log(formatedData);
        if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((error) => {
        console.log(
          "Error Occurred while fetching the fetching the user written blogs ",
          error.message
        );
      });
  };

  useEffect(() => {
    if (accessToken) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [accessToken, blogs, drafts, query]);

  const handleChange = (event) => {
    if (!event.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleSearch = (event) => {
    let searchQuery = event.target.value;
    setQuery(searchQuery);
    if (event.keyCode == 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };
  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <div className="relative max-md:mt-8 mb-10 ">
        <input
          type="search"
          placeholder="Search Blogs"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey mt-4"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-11 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InPageNavigation routes={["Published Blogs", "Drafts"]}>
        {
          // published blogs
          blogs === null ? (
            <Loader />
          ) : blogs.results.length ? (
            <>
              {blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                    <ManagePublishedBlogsCard
                      blog={{ ...blog, index: i, setStateFun: setBlogs }}
                    />
                  </AnimationWrapper>
                );
              })}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={getBlogs}
                additionalParam={{
                  draft: false,
                  deletedDocCount: blogs.deletedDocCount,
                }}
              />
            </>
          ) : (
            <NoDataMessage message="No Published Blogs" />
          )
        }

        {
          // draft blogs
          drafts === null ? (
            <Loader />
          ) : drafts.results.length ? (
            <>
              {drafts.results.map((blog, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                    <ManageDraftBlogPost
                      blog={{ ...blog, index: i, setStateFun: setDrafts }}
                    />
                  </AnimationWrapper>
                );
              })}

              <LoadMoreDataBtn
                state={drafts}
                fetchDataFun={getBlogs}
                additionalParam={{
                  draft: true,
                  deletedDocCount: drafts.deletedDocCount,
                }}
              />
            </>
          ) : (
            <NoDataMessage message="No Draft Blogs" />
          )
        }
      </InPageNavigation>
    </>
  );
};

export default ManageBlogs;
