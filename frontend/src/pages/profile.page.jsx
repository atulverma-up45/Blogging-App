import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../context/context";
import AboutUser from "../components/about.component";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    firstName: "",
    lastName: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
    total_blogs: 0, // Corrected typo in key name
  },
  social_links: {},
  joinedAt: " ",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);

  const { userAuth } = useContext(UserContext);
  const username = userAuth?.user?.username;

  const {
    personal_info: { firstName, lastName, username: profile_username, avatar, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data }) => {
        const user = data.user;
        if (user !== null) {
          setProfile(user);
          getBlogs({ user_id: user._id });
        } else {
          setLoading(false); // Set loading to false when profile is null
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        console.log("Received data:", data);
        const formattedData = {
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        };
        formattedData.user_id = user_id;
        console.log("formattedData", formattedData);
        setBlogs(formattedData);
        setLoading(false); // Set loading to false after blogs are fetched
      });
  };

  useEffect(() => {
    resetState();
    fetchUserProfile();
  }, [profileId]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : username === null ? (
        <PageNotFound />
      ) : (
        <section className="h-cover md:flex flex-row-reverse items-center gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={avatar}
              alt={firstName + " " + lastName}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl font-medium"> @{profile_username}</h1>
            <p className="text-xl capitalize h-6">{firstName + " " + lastName}</p>
            <p>
              {total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads
            </p>
            <div className="flex gap-4 mt-2">
              {profileId === username && (
                <Link to="/settings/edit-profile" className="btn-light rounded-md">
                  Edit Profile
                </Link>
              )}
            </div>
            <AboutUser
              className={"max-md:hidden"}
              bio={bio}
              joinedAt={joinedAt}
              social_links={social_links}
            />
          </div>
          <div className="max-md:mt-12 w-full">
            <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}>
              <>
                {loading ? (
                  <Loader />
                ) : blogs === null || blogs.data.length === 0 ? (
                  <NoDataMessage message="No Blog Published" />
                ) : (
                  blogs.data.map((blog, index) => (
                    <AnimationWrapper key={index} transition={{ duration: 1, delay: index * 0.1 }}>
                      <BlogPostCard content={blog} author={blog.author.personal_info} />
                    </AnimationWrapper>
                  ))
                )}
                {blogs && <LoadMoreDataBtn fetchDataFun={getBlogs} state={blogs} />}
              </>
              <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
            </InPageNavigation>
          </div>
        </section>
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
