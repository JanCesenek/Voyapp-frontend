import React from "react";
import { useUpdate } from "../hooks/use-update";
import Loading from "../components/loading";

const Intro = () => {
  const { data, isLoading } = useUpdate("/users");
  const getAdmin = data?.find((el) => el.admin);
  const adminPic = getAdmin?.profilePicture;

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col xl:w-3/4 items-center text-[1.5rem] my-20 bg-gradient-to-b from-black/50 to-green-700/30 shadow-black/50 shadow-lg rounded-lg p-10">
      <img
        src={adminPic}
        alt="admin pic"
        className="w-auto h-auto max-w-[10rem] max-h-[10rem] rounded-lg"
      />
      <p className="mt-10 text-[1.8rem] text-green-400">
        Welcome! Let me explain to you how this app works.
      </p>
      <p className="mt-5">
        Without an account, you are only able to view Destinations(trip suggestions) and
        Accommodation. To do anything else, you must log in or sign up.
      </p>
      <p className="mt-5">
        After logging in, you can see your profile with all of your details. You can edit some of
        your personal details (profile picture, email, phone) simply by clicking on it. You can also
        view/create/update/delete your destinations(trip suggestions), accommodation and
        reservations.
      </p>
      <p className="mt-5">
        Destinations can be liked, disliked, commented or you can also make a reservation, if you
        like the trip and want to attend.
      </p>
      <p className="mt-5">
        You can make a review about accommodation, or make a reservation by selecting any available
        date range.
      </p>
      <p className="mt-5">
        Please make note that reservations can be cancelled from both sides, either the person
        making the reseration or the post owner!
      </p>
    </div>
  );
};

export default Intro;
