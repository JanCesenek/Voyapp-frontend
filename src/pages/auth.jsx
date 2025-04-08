import React, { useState } from "react";
import Login from "../components/login";
import SignUp from "../components/signup";

const Auth = (props) => {
  const [hasAccount, setHasAccount] = useState(true);
  const loggedIn = localStorage.getItem("curUser");

  return loggedIn ? (
    <h1 className="mt-10">You are already logged in as {loggedIn}</h1>
  ) : hasAccount ? (
    <Login link={() => setHasAccount(false)} setLog={props.setLog} />
  ) : (
    <SignUp link={() => setHasAccount(true)} setLog={props.setLog} />
  );
};

export default Auth;
