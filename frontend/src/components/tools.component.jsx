// importing tools
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import RawTool from "@editorjs/raw";
import axios from "axios";
import { getCookie } from "../common/cookies";
import CodeTool from "@editorjs/code";

const uploadImageByURL = (url) => {
  return Promise.resolve(url)
    .then((imageUrl) => {
      return {
        success: 1,
        file: { url: imageUrl },
      };
    })
    .catch((error) => {
      return {
        success: 0,
        error: { message: "URL upload failed" },
      };
    });
};

const uploadImageByFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const accessToken = getCookie("accessToken");
  return axios
    .post(`${import.meta.env.VITE_SERVER_DOMAIN}/file-upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-accessToken": accessToken,
      },
    })
    .then((uploadResponse) => {
      return {
        success: 1,
        file: { url: uploadResponse.data.fileURL },
      };
    })
    .catch((error) => {
      return {
        success: 0,
        error: { message: "Image upload failed" },
      };
    });
};
export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading....",
      inlineToolbar : true,
      levels: [2, 3, 4],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
  HTML: RawTool,
  code: CodeTool,
};
