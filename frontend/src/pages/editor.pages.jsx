import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../context/context";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

export const EditorContext = createContext({});

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

function Editor() {
  const { blog_id } = useParams();
  const { userAuth: { accessToken } } = useContext(UserContext);

  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blog_id) {
      setLoading(false);
      return;
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blogDetails } }) => {
        setBlog(blogDetails || blogStructure);
        setLoading(false);
      })
      .catch((error) => {
        setBlog(null);
        setLoading(false);
      });
  }, [blog_id]);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor, // Corrected typo in function name
      }}
    >
      {accessToken === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
}

export default Editor;
