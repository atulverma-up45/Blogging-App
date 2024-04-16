import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/context";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import toast from "react-hot-toast";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let bioLimit = 150;

  let profileImgEle = useRef();
  let editProfileForm = useRef();
  const [profile, setprofile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  const {
    personal_info: {
      firstName,
      lastName,
      username: profile_username,
      bio,
      avatar,
      email,
    },
    social_links,
  } = profile;

  const {
    userAuth,
    setUserAuth,
    userAuth: { accessToken },
  } = useContext(UserContext);

  useEffect(() => {
    if (accessToken) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.user.username,
        })
        .then(({ data }) => {
          setprofile(data?.user);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [accessToken]);

  const hangleCharacterChange = (event) => {
    setCharactersLeft(bioLimit - event.target.value.length);
  };

  const handleImagePreview = (event) => {
    let img = event.target.files[0];
    profileImgEle.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };

  const handleImageUpload = (event) => {
    event.preventDefault();
    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading ....");
      event.target.setAttribute("disabled", true);
      const formData = new FormData();

      formData.append("avatar", updatedProfileImg);

      console.log(formData);

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-accessToken": accessToken,
            },
          }
        )
        .then(({ data }) => {
          const newUserAuth = {
            ...userAuth,
            user: {
              ...userAuth.user,
              avatar: data.avatar,
            },
          };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
          setUpdatedProfileImg(null);
          event.target.removeAttribute("disabled");
          toast.dismiss(loadingToast);
          toast.success("Image uploaded successfully 👍");
        })
        .catch((error) => {
          event.target.removeAttribute("disabled");
          toast.dismiss(loadingToast);
          console.error("Image upload failed:", error);
        });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      username,
      bio,
      youtube,
      instagram,
      facebook,
      twitter,
      github,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be at least 3 letters long");
    }

    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more then ${bioLimit} characters`);
    }

    let loadingToast = toast.loading("Updating .....");
    event.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            "X-accessToken": accessToken,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.user.username !== data.username) {
          const newUserAuth = {
            ...userAuth,
            user: {
              ...userAuth.user,
              username: data.username,
            },
          };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast)
        event.target.removeAttribute("disabled")
        toast.success("Profile Updated 👍")
      }).catch(({response})=>{
        toast.dismiss(loadingToast)
        event.target.removeAttribute("disabled")
        toast.error(response.data.message)
      })
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
                htmlFor="uploadImg"
                id="profileImgLable"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer ">
                  Upload Image
                </div>
                <img
                  ref={profileImgEle}
                  src={avatar}
                  alt={firstName + " " + lastName}
                />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .png , .jpg"
                hidden
                onChange={handleImagePreview}
              />

              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="firstName"
                    type="text"
                    value={firstName}
                    placeholder="firstName"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                type="text"
                name="username"
                value={profile_username}
                placeholder="Username"
                icon="fi-rr-at"
              />
              <p className="text-dark-grey -mt-3">
                Username will use to search user and will be visible at all
                users
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio ..."
                onChange={hangleCharacterChange}
              ></textarea>

              <p className="mt-1 text-dark-grey">
                {charactersLeft} charactor left
              </p>
              <p className="my-6 text-dark-grey">
                Add your social handles below{" "}
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        "fi " +
                        (key !== "website"
                          ? "fi-brands-" + key
                          : "fi-rr-globe") +
                        " text-2xl hover:text-black"
                      }
                    />
                  );
                })}
              </div>

              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
