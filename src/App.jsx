import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useRouteError } from "react-router-dom";
import RootLayout from "./pages/root";
import Intro from "./pages/intro";
import Profile from "./pages/profile";
import Destinations from "./pages/destinations";
import Accommodation from "./pages/accommodation";
import Auth from "./pages/auth";
import { api } from "./core/api";
import { BsHourglassSplit } from "react-icons/bs";

function App() {
  const loggedIn = localStorage.getItem("token");
  const [log, setLog] = useState(loggedIn);
  useEffect(() => {
    api
      .get("/users")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/destinations")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/likes")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/dislikes")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/comments")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/destination-reservations")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/rents")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/reviews")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/rent-reservations")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
    api
      .get("/notifications")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(`Get req err - ${err}`));
  }, []);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const { latitude } = pos.coords;
        const { longitude } = pos.coords;
        console.log(latitude, longitude);
        localStorage.setItem("lat", latitude);
        localStorage.setItem("lon", longitude);
      },
      function () {
        console.log("Could not get location!");
      }
    );
  }

  const CustomElement = () => {
    const error = useRouteError();
    console.error(error);
    return <BsHourglassSplit className="mt-10 w-[4rem] h-[4rem] animate-spin" />;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout log={log} setLog={() => setLog(!log)} />,
      children: [
        { index: true, element: <Intro /> },
        { path: "profile", element: <Profile /> },
        { path: "destinations", element: <Destinations /> },
        { path: "accommodation", element: <Accommodation /> },
        {
          path: "auth",
          element: <Auth setLog={() => setLog(!log)} />,
          errorElement: <CustomElement />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
