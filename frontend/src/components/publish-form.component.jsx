import React, { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../context/context";
import { useNavigate, useParams } from "react-router-dom";

function PublishForm() {
  let characterLimit = 200;
  let tagLimits = 10;
  const { blog_id } = useParams();
  const {
    blog: { banner, title, tags, des, content },
    setEditorState,
    setBlog,
    blog,
  } = useContext(EditorContext);

  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (event) => {
    let input = event.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDesChange = (event) => {
    let input = event.target;
    setBlog({ ...blog, des: input.value });
  };

  const handleTitleKyeDown = (event) => {
    if (event.keyCode == 13) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      let tag = event.target.value.trim().toLowerCase();

      if (tags.length < tagLimits && tag.length && !tags.includes(tag)) {
        setBlog({ ...blog, tags: [...tags, tag] });
      } else {
        toast.error(`You can add max ${tagLimits}`);
      }

      event.target.value = "";
    }
  };

  const publishBlog = (event) => {
    if (event.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write Blog Title Before Publishing");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `Write a description about your blog withing ${characterLimit} characters to publish`
      );
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us Rank Your Content");
    }

    const loadingToast = toast.loading("Publishing .....");
    event.target.classList.add("disable");

    let blogObj = {
      title,
      des,
      banner,
      content,
      tags,
      draft: false,
    };

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            "X-accessToken": `${accessToken}`,
          },
        }
      )
      .then(() => {
        event.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published 👍");
        setTimeout(() => {
          navigate("/dashboard/blogs");
        }, 500);
      })
      .catch(({ response }) => {
        event.target.classList.remove("disable");
        toast.dismiss(loadingToast);

        return toast.error(response.data.message);
      });
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="" />
          </div>
          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>
          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>
        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <input
            onChange={handleBlogTitleChange}
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
          />
          <p className="text-dark-grey mb-2 mt-9">
            Short Description About Blog
          </p>
          <textarea
            maxLength={characterLimit}
            defaultValue={des}
            className="h-48 resize-none leading-7 input-box pl-4"
            onChange={handleBlogDesChange}
            onKeyDown={handleTitleKyeDown}
          ></textarea>

          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLimit - des.length} characters left
          </p>

          <p>Topics - (Helps in Seaching And Ranking Your Blog)</p>
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Topic"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tag={tag} key={i} tagIndex={i} />;
            })}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-right">
            {tagLimits - tags.length} Tags Left
          </p>
          <button onClick={publishBlog} className="btn-dark px-8">
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
}

export default PublishForm;
