import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

function SearchPage() {
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const { query } = useParams();

  useEffect(() => {
    searchBlog({ query, page: 1 });
  }, [query]);

  const searchBlog = ({ page = 1, create_new_arr = false }) => {
    setLoading(true);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        try {
          const formatedData = await filterPaginationData({
            state: blogs,
            data: data.blogs,
            page,
            countRoute: "/search-blogs-count",
            data_to_send: { query },
            create_new_arr,
          });
          setBlogs(formatedData);
        } catch (error) {
          console.error("Error while formatting data:", error);
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error while fetching latest blogs:", err);
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlog({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No User Found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results for "${query}" `, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
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
            {<LoadMoreDataBtn  state={blogs} fetchDataFun={searchBlog} />}
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">User Related to Search <i className="fi fi-rr-user mt-1 "></i></h1>
        <UserCardWrapper />
      </div>
    </section>
  );
}

export default SearchPage;
