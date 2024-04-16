import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../context/context";

const ChangePassword = () => {
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const changePasswordForm = useRef();
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const handleSubmit = (event) => {
    event.preventDefault();

    let form = new FormData(changePasswordForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword.length) {
      return toast.error("Current Password is Required");
    }
    if (!newPassword.length) {
      return toast.error("New Password is Required");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    event.target.setAttribute("disabled", true);
    let loadingToast = toast.loading("Updating ....");
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
        headers: {
          "x-accessToken": `${accessToken}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        event.target.removeAttribute("disabled");
        return toast.success("Password Updated");
      })
      .catch(({response: {data}}) => {
        toast.dismiss(loadingToast);
        event.target.removeAttribute("disabled");
        return toast.error(data?.message);
      });
  };
  return (
    <AnimationWrapper>
      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            name="currentPassword"
            type="password"
            className="profile-edit-input"
            placeholder="Current Password"
            icon="fi-rr-unlock"
          />
          <InputBox
            name="newPassword"
            type="password"
            className="profile-edit-input"
            placeholder="New Password"
            icon="fi-rr-unlock"
          />

          <button
            onClick={handleSubmit}
            className="btn-dark px-10"
            type="submit"
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
