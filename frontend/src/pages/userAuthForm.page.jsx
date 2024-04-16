import { useContext, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { storeInSession } from "../common/session";
import { UserContext } from "../context/context";
import { setCookie } from "../common/cookies";
import { m } from "framer-motion";

const UserAuthForm = ({ type }) => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const { accessToken } = userAuth;


  const userAuthThroughServer = async (serverRoute, formData) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
        formData
      );

      toast.success(response.data.message);
      storeInSession("user", JSON.stringify(response.data));
      setCookie('accessToken', response.data.accessToken, 2)
      setUserAuth(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error during authentication"
      );
      // console.error("Error fetching data:", error.message, error.response);;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let serverRoute = type === "sign-in" ? "/signin" : "/signup";

    let form = new FormData(formElement);
    const formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    const contactNumberRegex = /^\d{10}$/;

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
    } = formData;

    if (type === "sign-up") {
      if (!firstName) {
        return toast.error("First Name is Required");
      }

      if (!lastName) {
        return toast.error("Last Name is Required");
      }

      const contactNumberRegex = /^\d{10}$/;

      if (!contactNumber) {
        return toast.error("Contact Number is Required");
      } else if (!contactNumberRegex.test(contactNumber)) {
        return toast.error("Please enter a valid 10-digit contact number");
      }

      if (password !== confirmPassword) {
        return toast.error("Password and Confirm Password Should Be Same");
      }
    }

    if (!emailRegex.test(email)) {
      return toast.error("Email is Invalid");
    }

    if (!password) {
      return toast.error("Password is Required");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password Should Be 6 to 20 characters Long with a numeric, 1 LowerCase and 1 upperCase letters"
      );
    }

    try {
      await userAuthThroughServer(serverRoute, formData);
    } catch (error) {
      console.log("Error during authentication:", error);
    }
  };

  return accessToken ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome back" : "Join us today"}
          </h1>
          {type !== "sign-in" ? (
            <div className="flex gap-2">
              <InputBox
                name="firstName"
                type="text"
                placeholder="First Name"
                icon="fi-rr-user"
              />
              <InputBox name="lastName" type="text" placeholder="Last Name" />
            </div>
          ) : null}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />
          {type !== "sign-in" ? (
            <InputBox
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              icon="fi-rr-key"
            />
          ) : null}
          {type !== "sign-in" ? (
            <InputBox
              name="contactNumber"
              type="tel"
              placeholder="Contact Number"
              icon="fi-ss-evelope"
            />
          ) : null}
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>
          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>Or</p>
            <hr className="w-1/2 border-black" />
          </div>
          {/* <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} alt="Google" className="w-5" />
            Continue with Google
          </button> */}

          {type === "sign-in" ? (
            <p className="mt-6 text-dart-grey text-xl text-center">
              Don't Have an Account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join Us Today{" "}
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dart-grey text-xl text-center">
              Already a Member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in Here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
