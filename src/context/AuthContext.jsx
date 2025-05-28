import React, { createContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Success from "../audio/Success.mp3";
import Error from "../audio/Error.mp3";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const notifyContext = (msg, state) => {
    if (state === "success") {
      const audio = new Audio(Success);
      audio.play();
      toast.success(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } else if (state === "error") {
      const audio = new Audio(Error);
      audio.play();
      toast.error(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  return <AuthContext.Provider value={{ notifyContext }}>{children}</AuthContext.Provider>;
};
