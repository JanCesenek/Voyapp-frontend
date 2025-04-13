import React, { useState, useContext } from "react";
import { Form, useNavigate } from "react-router-dom";
import Button from "./custom/button";
import Submitting from "./submitting";
import { api } from "../core/api";
import { AuthContext } from "../context/AuthContext";

const Login = (props) => {
  const [usernameValue, setUsernameValue] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { notifyContext } = useContext(AuthContext);

  const addBearerToken = (token) => {
    if (!token) {
      console.log("Token can't be undefined or null.");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logIn = async () => {
    const username = usernameValue[0]?.toUpperCase() + usernameValue?.slice(1).toLowerCase();
    setIsSubmitting(true);
    await api
      .post("/login", {
        username,
        password,
      })
      .then((res) => {
        const token = res.data.token;
        addBearerToken(token);
        localStorage.setItem("curUser", username);
        localStorage.setItem("token", token);
        notifyContext(`Welcome aboard, ${username}`, "login");
        props.setLog();
        navigate("/");
      })
      .catch((err) => {
        console.log(`Invalid credentials - ${err}`);
        notifyContext("Invalid credentials! Try again...", "error");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex relative flex-col justify-start items-center">
      <Form className="rounded-md p-5 flex flex-col justify-center items-center bg-gradient-to-b from-black/50 to-green-800/50 shadow-lg shadow-black text-[2rem] mt-10 [&>*]:my-2">
        <div className="w-full flex justify-between [&>*]:mx-2">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={usernameValue}
            onChange={(e) => setUsernameValue(e.target.value)}
            className="bg-black/20 shadow-md shadow-black rounded-md focus:outline-none"
          />
        </div>
        <div className="w-full flex justify-between [&>*]:mx-2">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/20 shadow-md shadow-black rounded-md focus:outline-none"
          />
        </div>
        <Button
          title={isSubmitting ? "Logging in..." : "Log In"}
          submit
          classes={
            (usernameValue.length < 6 || password.length < 8 || isSubmitting) &&
            "pointer-events-none opacity-50"
          }
          onClick={logIn}
        />
      </Form>
      {isSubmitting && <Submitting />}
      <p
        className="mt-5 text-green-400 underline hover:cursor-pointer text-[1.5rem]"
        onClick={props.link}>
        New user? Click here to create an account.
      </p>
    </div>
  );
};

export default Login;
