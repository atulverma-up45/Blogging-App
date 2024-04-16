import React, { useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { IKContext, IKUpload } from "imagekitio-react";
import { publicKey, urlEndpoint, authenticator } from "../common/imageKit.js";
import { EditorContext } from "../pages/editor.pages.jsx";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component.jsx";
import axios from "axios";
import { UserContext } from "../context/context.jsx";

function BlogEditor() {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor, // Corrected function name here
    setEditorState,
  } = useContext(EditorContext);

  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const {blog_id} = useParams()

  const navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Lets Write Now",
        })
      );
    }
  }, []);

  const onError = (err) => {
    toast.error("Image is Not Uploaded, Internal Error");
  };

  const handleBannerImg = (res) => {
    toast.success("Image Uploaded Successfully");

    setBlog({ ...blog, banner: res.url });
  };

  const handleTitleKyeDown = (event) => {
    if (event.keyCode == 13) {
      event.preventDefault();
    }
  };

  const handleTitleChange = (event) => {
    const input = event.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handlePublicEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a Blog Banner to Publish it");
    }
    if (!title.length) {
      return toast.error("Write a Title First Before Publish it");
    }
    if (textEditor.isReady)
      textEditor.save().then((data) => {
        if (data.blocks.length) {
          setBlog({ ...blog, content: data });
          setEditorState("publish");
        } else {
          return toast.error("Write Something in Your Blog To Publish it");
        }
      });
  };

  const handleSaveDraft = (event) => {
    if (event.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write Blog Title Before Saving as a draft");
    }

    const loadingToast = toast.loading("Saving Draft .....");
    event.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          des,
          banner,
          content,
          tags,
          draft: true,
        };

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id: blog_id}, {
            headers: {
              "X-accessToken": `${accessToken}`,
            },
          })
          .then(() => {
            event.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved 👍");
            setTimeout(() => {
              navigate("/dashboard/blogs");
            }, 500);
          })
          .catch(({ response }) => {
            event.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            return toast.error(response.data.message);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link className="flex-none w-10" to="/">
          <img src={logo} alt="" />
        </Link>
        <h3 className="max-md:hidden text-black line-clamp-1 w-full ">
          {title.length ? title : "New Blog"}
        </h3>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublicEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img
                  src={banner || defaultBanner}
                  alt="Default Post Banner"
                  className="z-20"
                />
                <IKContext
                  publicKey={publicKey}
                  urlEndpoint={urlEndpoint}
                  authenticator={authenticator}
                >
                  <IKUpload
                    id="uploadBanner"
                    type="file"
                    accept=".png, .jpg, .jpeg,  .webp"
                    hidden
                    folder={"/BlogginApp"}
                    validateFile={(file) => file.size < 2000000}
                    useUniqueFileName={true}
                    onError={onError}
                    onSuccess={handleBannerImg}
                  />
                </IKContext>
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKyeDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
}

export default BlogEditor;
