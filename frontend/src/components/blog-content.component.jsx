import Prism from 'prismjs'; 
import 'prismjs/themes/prism-okaidia.css';
import { useEffect } from 'react';

const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt="Blog" />
      {caption.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : null}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : null}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <ol className={`pl-5 ${style === "ordered" ? " list-decimal" : " list-disc"}`}>
      {items.map((listItem, i) => (
        <li
          key={i}
          className="my-4"
          dangerouslySetInnerHTML={{ __html: listItem }}
        ></li>
      ))}
    </ol>
  );
};

const Code = ({ code }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="bg-black mb-4 rounded-md">
      <div className="p-4 overflow-y-auto text-white">
        <pre>
          <code className='language-javascript'>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const HTML = ({ code }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="bg-black mb-4 rounded-md">
      <div className="p-4 overflow-y-auto text-white">
        <pre>
          <code  className='language-markup'>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const BlogContent = ({ block }) => {
  const { type, data } = block;

  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  if (type === "header") {
    if (data.level === 2) {
      return (
        <h2
          className="text-4xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h2>
      );
    } else if (data.level === 3) {
      return (
        <h3
          className="text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h3>
      );
    } else if (data.level === 4) {
      return (
        <h4
          className="text-2xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h4>
      );
    } else if (data.level === 5) {
      return (
        <h5
          className="text-xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h5>
      );
    }
  }

  if (type === "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  if (type === "list") {
    return <List style={data.style} items={data.items} />;
  }

  if (type === "code") {
    return <Code code={data.code} />;
  }

  if (type === "HTML") {
    return <HTML code={data.html} />;
  }

  return <h1>this is a block</h1>;
};

export default BlogContent;
