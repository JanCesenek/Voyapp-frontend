import React, { useState } from "react";
import Login from "../components/login";
import SignUp from "../components/signup";
import { useUpdate } from "../hooks/use-update";
// import Loading from "../components/custom/loading";

const Auth = (props) => {
  const [hasAccount, setHasAccount] = useState(true);
  const loggedIn = localStorage.getItem("curUser");
  const { isLoading } = useUpdate("/users");

  // if (isLoading) return <Loading />;

  return loggedIn ? (
    <h1 className="mt-10">You are already logged in as {loggedIn}</h1>
  ) : hasAccount ? (
    <Login link={() => setHasAccount(false)} setLog={props.setLog} />
  ) : (
    <SignUp link={() => setHasAccount(true)} setLog={props.setLog} />
  );
};

export default Auth;
