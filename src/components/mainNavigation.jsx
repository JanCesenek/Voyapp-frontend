import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../core/api";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";
import { GiCircleSparks } from "react-icons/gi";
import { useUpdate } from "../hooks/use-update";
import Loading from "./loading";
import Leaving from "../audio/Leaving.mp3";

const MainNavigation = (props) => {
  const { data, isLoading } = useUpdate("/notifications");
  const [showMenu, setShowMenu] = useState(false);
  const curUsername = localStorage.getItem("curUser");
  const anyNotifications = data?.find((el) => el.recipient === curUsername);

  const removeBearerToken = () => {
    delete api.defaults.headers.common["Authorization"];
  };

  const logOut = (e) => {
    if (window.confirm("Are you sure you wanna log out?")) {
      removeBearerToken();
      localStorage.clear();
      props.setLog();
      const audio = new Audio(Leaving);
      audio.play();
    } else e.preventDefault();
  };

  if (isLoading) return <Loading />;

  return (
    <nav className="flex justify-around w-full mt-4 text-[1.5rem] font-['Spinnaker',sans-serif] italic">
      <span className="hidden sm:flex justify-around w-full">
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-green-500 underline font-bold" : undefined
          }
          to="/">
          Intro
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-green-500 underline font-bold flex" : "flex"
          }
          to="/profile">
          Profile
          {anyNotifications && <GiCircleSparks className="w-3 h-3 text-green-400 animate-pulse" />}
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-green-500 underline font-bold" : undefined
          }
          to="/destinations">
          Destinations
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-green-500 underline font-bold" : undefined
          }
          to="/accommodation">
          Accommodation
        </NavLink>
        {props.log ? (
          <NavLink
            className="bg-black/40 px-2 rounded-md h-max shadow-md shadow-green-600/50"
            onClick={logOut}
            to="/auth">
            Log Out
          </NavLink>
        ) : (
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-green-500 underline font-bold" : undefined
            }
            to="/auth">
            Auth
          </NavLink>
        )}
      </span>
      <span className="flex sm:hidden justify-around w-full">
        <NavLink
          className={({ isActive }) =>
            isActive ? "text-green-500 underline font-bold" : undefined
          }
          to="/">
          Intro
        </NavLink>
        <div className="flex flex-col items-center">
          {showMenu ? (
            <FaChevronCircleUp
              className="hover:cursor-pointer"
              onClick={() => setShowMenu(false)}
            />
          ) : (
            <FaChevronCircleDown
              className="hover:cursor-pointer"
              onClick={() => setShowMenu(true)}
            />
          )}
          {showMenu && (
            <div className="flex flex-col items-center [&>*]:my-2 mt-5">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "text-green-500 underline font-bold flex" : "flex"
                }
                to="/profile">
                Profile
                {anyNotifications && (
                  <GiCircleSparks className="w-3 h-3 text-green-400 animate-pulse" />
                )}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "text-green-500 underline font-bold" : undefined
                }
                to="/destinations">
                Destinations
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "text-green-500 underline font-bold" : undefined
                }
                to="/accommodation">
                Accommodation
              </NavLink>
            </div>
          )}
        </div>
        {props.log ? (
          <NavLink
            className="bg-black/40 px-2 rounded-md h-max shadow-md shadow-green-600/50"
            onClick={logOut}
            to="/auth">
            Log Out
          </NavLink>
        ) : (
          <NavLink
            className={({ isActive }) =>
              isActive ? "text-green-500 underline font-bold" : undefined
            }
            to="/auth">
            Auth
          </NavLink>
        )}
      </span>
    </nav>
  );
};

export default MainNavigation;
