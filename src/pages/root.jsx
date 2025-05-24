import React from "react";
import MainNavigation from "../components/mainNavigation";
import { Outlet } from "react-router-dom";
import { FaCopyright } from "react-icons/fa";
import { GiGlobe } from "react-icons/gi";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../imgs/flamebulb.svg";

const RootLayout = (props) => {
  return (
    <div className="bg-gradient-to-b from-black/70 to-green-600/30">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Flip}
      />
      <div className="min-h-screen [@media(min-width:1700px)]:mx-40 flex flex-col items-center">
        <MainNavigation log={props.log} setLog={props.setLog} />
        <div
          className={`text-[4rem] flex items-center mt-10 font-["Spinnaker",sans-serif] italic font-bold p-5 bg-gradient-to-b from-black/50 to-green-400/30 rounded-2xl shadow-xl shadow-black hover:shadow-green-400 hover:translate-x-2 hover:translate-y-[-.5rem]`}>
          <h1>Voyapp</h1>
          <GiGlobe className="ml-5" />
        </div>
        <Outlet />
      </div>
      <div className="w-full h-[2rem] bg-green-800/80 flex justify-center items-center text-[0.8rem] mt-20">
        <FaCopyright className=" mr-2" />
        <div className="flex items-center">
          <p className="mr-2">|</p>
          <img src={logo} alt="logo" className="w-[0.8rem]" />
          <p className="ml-2">Jan Cesenek 2025 | All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
