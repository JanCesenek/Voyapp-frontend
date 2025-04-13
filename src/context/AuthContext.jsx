import React, { createContext, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AirportAnnouncement from "../audio/AirportAnnouncement.mp3";
import DoubleHorn from "../audio/DoubleHorn.mp3";
import Leaving from "../audio/Leaving.mp3";
import StartingCar from "../audio/StartingCar.mp3";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const notifyContext = (msg, state) => {
    if (state === "success" || state === "login" || state === "logout") {
      if (state === "success") {
        const audio = new Audio(AirportAnnouncement);
        audio.play();
      } else if (state === "login") {
        const audio = new Audio(StartingCar);
        audio.play();
      } else if (state === "logout") {
        const audio = new Audio(Leaving);
        audio.play();
      }
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
      const audio = new Audio(DoubleHorn);
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
