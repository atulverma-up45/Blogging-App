import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, tagIndex }) => {
  const { blog, setBlog } = useContext(EditorContext);

  const handleTagDelete = () => {
    const updatedTags = blog.tags.filter((item) => item !== tag);
    setBlog({ ...blog, tags: updatedTags });
  };
  const handleTagEdit = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      let currentTag = event.target.value;
      tags[tagIndex] = currentTag;
      setBlog({ ...blog, tags });
      event.target.setAttribute("contentEditable", false);
    }
  };

  const addEditable = (event) => {
    event.target.setAttribute("contentEditable", true);
    event.target.focus();
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p
        className="outline-none"
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        <button
          onClick={handleTagDelete}
          className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2 "
        >
          <i className="fi fi-br-cross text-sm pointer-events-none"></i>
        </button>
        {tag}
      </p>
    </div>
  );
};

export default Tag;
