import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/button";
import { api } from "../core/api";
import supabase from "../core/supabase";
import UseInput from "../hooks/use-input";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillEyeFill, BsFillEyeSlashFill, BsFillFileImageFill } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { MdError } from "react-icons/md";
import { useUpdate } from "../hooks/use-update";
import { v4 as uuid } from "uuid";
import { AuthContext } from "../context/AuthContext";

const SignUp = (props) => {
  const { notifyContext } = useContext(AuthContext);

  // Variables ensuring correct validation in frontend, won't allow user to submit a form until conditions are met
  const {
    value: firstNameValue,
    isValid: firstNameIsValid,
    hasError: firstNameHasError,
    changeHandler: firstNameChangeHandler,
    blurHandler: firstNameBlurHandler,
    reset: firstNameReset,
  } = UseInput((value) => /^[a-zA-Z\s]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: lastNameValue,
    isValid: lastNameIsValid,
    hasError: lastNameHasError,
    changeHandler: lastNameChangeHandler,
    blurHandler: lastNameBlurHandler,
    reset: lastNameReset,
  } = UseInput((value) => /^[a-zA-Z\s]+$/.test(value) && value.length >= 2 && value.length <= 30);

  const {
    value: usernameValue,
    isValid: usernameIsValid,
    hasError: usernameHasError,
    changeHandler: usernameChangeHandler,
    blurHandler: usernameBlurHandler,
    reset: usernameReset,
  } = UseInput(
    (value) =>
      value.length >= 6 &&
      value.length <= 16 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /^[A-Za-z0-9]*$/.test(value)
  );

  const {
    value: passwordValue,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    changeHandler: passwordChangeHandler,
    blurHandler: passwordBlurHandler,
    reset: passwordReset,
  } = UseInput(
    (value) =>
      value.length >= 8 &&
      value.length <= 16 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[$&+,:;=?@#|'"<>.⌃*()%!-_]/.test(value)
  );

  const {
    value: emailValue,
    isValid: emailIsValid,
    hasError: emailHasError,
    changeHandler: emailChangeHandler,
    blurHandler: emailBlurHandler,
    reset: emailReset,
  } = UseInput(
    (value) =>
      value.length >= 8 && value.length <= 30 && /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,4}/.test(value)
  );

  const {
    value: phoneValue,
    isValid: phoneIsValid,
    hasError: phoneHasError,
    changeHandler: phoneChangeHandler,
    blurHandler: phoneBlurHandler,
    reset: phoneReset,
  } = UseInput(
    (value) =>
      value.length >= 8 &&
      value.length <= 15 &&
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value)
  );

  const [profilePic, setProfilePic] = useState(null);
  const [gender, setGender] = useState("M");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [notification, setNotification] = useState(false);

  const { refetch } = useUpdate("/users");

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  useEffect(() => {
    return () => {
      if (profilePic) {
        URL.revokeObjectURL(profilePic.preview);
      }
    };
  }, [profilePic]);

  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    setProfilePic(e.target.files[0]);
  };

  const resetForm = () => {
    firstNameReset();
    lastNameReset();
    usernameReset();
    passwordReset();
    emailReset();
    phoneReset();
    setGender("M");
  };

  const createNewUser = async (e) => {
    e.preventDefault();
    const uniqueID = uuid();
    const firstName = firstNameValue[0]?.toUpperCase() + firstNameValue?.slice(1).toLowerCase();
    const lastName = lastNameValue[0]?.toUpperCase() + lastNameValue?.slice(1).toLowerCase();
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();

    const defaultPic =
      gender === "M"
        ? "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/Default1.png"
        : "https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/Default6.png";
    const handleUpload = async () => {
      const { data, error } = await supabase.storage
        .from("traveling")
        .upload(`userPics/${uniqueID}`, profilePic, {
          cacheControl: "3600",
          upsert: false,
        });

      const { data: dataGet, error: errorGet } = await supabase.storage
        .from("traveling")
        .list("userPics");

      if (error) {
        console.log("Error uploading file...", error);
      } else {
        console.log("File uploaded!", data.path);
      }

      if (errorGet) {
        console.log("Error listing files...", error);
      } else {
        console.log("Files listed!", dataGet);
      }
    };
    if (profilePic) {
      await handleUpload();
    }

    const postReqPayload = {
      firstName,
      lastName,
      username,
      password: passwordValue,
      email: emailValue,
      phone: phoneValue,
      gender,
      profilePicture: profilePic
        ? `https://cxfluuggeeoujjwckzuu.supabase.co/storage/v1/object/public/traveling/userPics/${uniqueID}`
        : defaultPic,
    };
    setIsSubmitting(true);
    await api
      .post("/signup", postReqPayload)
      .then(async (res) => {
        await refetch();
        const token = res.data.token;
        addBearerToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("curUser", username);
        notifyContext(`Welcome to the traveller's club, ${username}!`, "success");
        resetForm();
        props.setLog();
        navigate("/");
      })
      .catch((err) => {
        console.log(`Post req err - ${err}`);
        notifyContext("Invalid credentials! Try again...", "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const validForm =
    firstNameIsValid &&
    lastNameIsValid &&
    usernameIsValid &&
    passwordIsValid &&
    emailIsValid &&
    phoneIsValid;

  return (
    <div className="flex flex-col items-center text-[1.3rem]">
      <div className="w-[50rem] mt-10 bg-gradient-to-b from-black/50 to-green-800/50 shadow-lg shadow-black px-5 py-2 rounded-md">
        <h2 className="text-[2rem] text-center">Validation rules:</h2>
        <p>First name, Last name: 2-30 characters, letters only</p>
        <p>Username: 6-16 characters, upper+lowercase and at least one number</p>
        <p>
          Password: 8-16 characters, must contain lower+uppercase, number and a special character
        </p>
        <p>Profile pic: voluntary, if none provided, default will be used based on gender</p>
        <p className="text-green-400 font-bold">
          Note: It won't be possible to submit the form until the conditions are met!
        </p>
      </div>
      <div className="w-[50rem] bg-gradient-to-b from-black/50 to-green-800/50 shadow-lg shadow-black rounded-md mt-10 bg-black bg-opacity-50 p-5">
        <Form method="post" className="flex flex-col items-start [&>*]:my-2 p-2 text-[1.8rem]">
          <div className="flex">
            <label htmlFor="firstName" className="min-w-[15rem] ml-2">
              First name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstNameValue}
              onChange={firstNameChangeHandler}
              onBlur={firstNameBlurHandler}
              className={`bg-green-800/30 shadow-md shadow-green-800/50 rounded-md focus:outline-none ${
                firstNameHasError && "border !border-green-300 animate-pulse"
              }`}
            />
          </div>
          <div className="flex">
            <label htmlFor="lastName" className="min-w-[15rem] ml-2">
              Last name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastNameValue}
              onChange={lastNameChangeHandler}
              onBlur={lastNameBlurHandler}
              className={`bg-green-800/30 shadow-md shadow-green-800/50 rounded-md focus:outline-none ${
                lastNameHasError && "border !border-green-300 animate-pulse"
              }`}
            />
          </div>
          <div className="flex">
            <label htmlFor="username" className="min-w-[15rem] ml-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={usernameValue}
              onChange={usernameChangeHandler}
              onBlur={usernameBlurHandler}
              className={`bg-black/20 shadow-md shadow-black rounded-md focus:outline-none ${
                usernameHasError && "border !border-green-300 animate-pulse"
              }`}
            />
          </div>
          <div className="flex">
            <label htmlFor="password" className="min-w-[15rem] ml-2">
              Password:
            </label>
            <input
              type={passwordVisibility ? "text" : "password"}
              id="password"
              name="password"
              value={passwordValue}
              onChange={passwordChangeHandler}
              onBlur={passwordBlurHandler}
              className={`bg-black/20 shadow-md shadow-black rounded-md focus:outline-none ${
                passwordHasError && "border !border-green-300 animate-pulse"
              }`}
            />
            {passwordVisibility ? (
              <BsFillEyeSlashFill
                className="w-10 h-10 hover:cursor-pointer self-center ml-2"
                onClick={() => setPasswordVisibility(!passwordVisibility)}
              />
            ) : (
              <BsFillEyeFill
                className="w-10 h-10 hover:cursor-pointer self-center ml-2"
                onClick={() => setPasswordVisibility(!passwordVisibility)}
              />
            )}
          </div>
          <div className="flex items-center max-w-[40rem]">
            <p className="min-w-[15rem] ml-2">Profile picture:</p>
            <label htmlFor="pic" className="flex w-[15rem] text-[1rem] ml-5 hover:cursor-pointer">
              <BsFillFileImageFill /> {profilePic ? profilePic.name : "Upload image"}
            </label>
            <input
              type="file"
              name="pic"
              id="pic"
              size="10"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {profilePic && (
              <AiFillCloseCircle
                className="w-3 h-3 hover:cursor-pointer mr-2"
                onClick={() => {
                  fileInputRef.current.value = null;
                  setProfilePic(null);
                }}
              />
            )}
          </div>
          <div className="flex">
            <label htmlFor="gender" className="min-w-[15rem] ml-2">
              Gender:
            </label>
            <select
              name="gender"
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bg-black/20 shadow-md shadow-black rounded-md focus:outline-none">
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div className="flex">
            <label htmlFor="lastName" className="min-w-[15rem] ml-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailValue}
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
              className={`bg-black/20 shadow-md shadow-black rounded-md focus:outline-none ${
                emailHasError && "border !border-green-300 animate-pulse"
              }`}
            />
          </div>
          <div className="flex">
            <label htmlFor="lastName" className="min-w-[15rem] ml-2">
              Phone:
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneValue}
              onChange={phoneChangeHandler}
              onBlur={phoneBlurHandler}
              className={`bg-black/20 shadow-md shadow-black rounded-md focus:outline-none ${
                phoneHasError && "border !border-green-300 animate-pulse"
              }`}
            />
          </div>
          <Button
            title={isSubmitting ? "Creating..." : "Create New User"}
            classes={`self-center !mt-8 ${
              (!validForm || isSubmitting) && "pointer-events-none opacity-50"
            }`}
            submit
            onClick={createNewUser}
          />
        </Form>
      </div>
      {/* {isSubmitting && <Submitting />} */}
      <p
        className="my-10 text-green-400 underline hover:cursor-pointer text-[1.5rem]"
        onClick={props.link}>
        Already have an account? Click here to log in!
      </p>
    </div>
  );
};

export default SignUp;
