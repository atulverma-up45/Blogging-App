import { createContext, useEffect, useState } from "react";
import { lookInSession } from "../common/session";

export const UserContext = createContext({});

export const ContextProvider = (props) => {

  const [userAuth, setUserAuth] = useState({ accessToken: null });

  useEffect(() => {
    let userInSession = lookInSession("user");
   
    if (userInSession) {
      setUserAuth(JSON.parse(userInSession));
    }
   
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      {props.children}
    </UserContext.Provider>
  );
};
