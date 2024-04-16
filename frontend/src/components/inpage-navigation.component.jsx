import { useEffect, useRef, useState } from "react";

const InPageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  const activeTabLineRef = useRef();
  const activeTabRef = useRef();
  const [isPageNavIndex, setIsPageNavIndex] = useState(defaultActiveIndex);

  const changePageState = (btn, index) => {
    const { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";

    setIsPageNavIndex(index);
  };

  useEffect(() => {
    changePageState(activeTabRef.current, defaultActiveIndex);
  }, [defaultActiveIndex]); // Add defaultActiveIndex to the dependency array

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto ">
        {routes.map((route, i) => {
          return (
            <button
              ref={i === defaultActiveIndex ? activeTabRef : null}
              key={i}
              className={
                "p-4 px-5 capitalize " +
                (isPageNavIndex === i ? "text-black" : "text-dark-grey ") +
                (defaultHidden.includes(route) ? "md:hidden" : "")
              }
              onClick={(event) => {
                changePageState(event.target, i);
              }}
            >
              {route}
            </button>
          );
        })}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>
      {Array.isArray(children) ? children[isPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
