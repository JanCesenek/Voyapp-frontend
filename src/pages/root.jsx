import React from "react";
import MainNavigation from "../components/mainNavigation";
import { Outlet } from "react-router-dom";
import { GiGlobe } from "react-icons/gi";

const RootLayout = (props) => {
  return (
    <div className="bg-gradient-to-b from-black/70 to-green-600/30">
      <div className="min-h-screen [@media(min-width:1700px)]:mx-40 flex flex-col items-center bg-gradient-to-r from-transparent via-black/30">
        <MainNavigation log={props.log} setLog={props.setLog} />
        <div
          className={`text-[4rem] flex items-center mt-10 font-["Spinnaker",sans-serif] italic font-bold p-5 bg-gradient-to-b from-black/50 to-green-400/30 rounded-2xl shadow-2xl shadow-green-600 hover:shadow-green-400 hover:translate-x-2 hover:translate-y-[-.5rem]`}>
          <h1>Voyapp</h1>
          <GiGlobe className="ml-5" />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
