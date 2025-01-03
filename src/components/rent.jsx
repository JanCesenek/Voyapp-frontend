import React from "react";
import { FaMapMarkerAlt, FaEuroSign, FaSignInAlt, FaWindowClose } from "react-icons/fa";
import { BsStar, BsStarFill, BsStarHalf } from "react-icons/bs";
import { useUpdate } from "../hooks/use-update";
import Loading from "./loading";
import { supabase } from "../core/supabase";
import { api } from "../core/api";

const Rent = (props) => {
  const { data: usersData, isLoading: usersLoading } = useUpdate("/users");
  const { data: reviewsData, isLoading: reviewsLoading } = useUpdate("/reviews");
  const { refetch } = useUpdate("/rents");
  const anyReviews = reviewsData?.find((el) => el.postID === props.id);
  const token = localStorage.getItem("token");
  const curUsername = localStorage.getItem("curUser");
  const curUser = usersData?.find((el) => el.username === curUsername);
  const admin = curUser?.admin;

  const getStars = (el) => {
    if (+el >= 4.75)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
        </span>
      );
    else if (+el < 4.75 && +el >= 4.25)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
        </span>
      );
    else if (+el < 4.25 && +el >= 3.75)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
        </span>
      );
    else if (+el < 3.75 && +el >= 3.25)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
        </span>
      );
    else if (+el < 3.25 && +el >= 2.75)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
        </span>
      );
    else if (+el < 2.75 && +el >= 2.25)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
        </span>
      );
    else if (+el < 2.25 && +el >= 1.75)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
        </span>
      );
    else if (+el < 1.75 && +el >= 1.25)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
        </span>
      );
    else if (+el < 1.25 && +el >= 0.75)
      return (
        <span className="flex justify-around">
          <BsStarFill />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </span>
      );
    else if (+el < 0.75 && +el >= 0.25)
      return (
        <span className="flex justify-around">
          <BsStarHalf />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </span>
      );
    else {
      return (
        <span className="flex justify-around">
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
          <BsStar />
        </span>
      );
    }
  };

  const deletePost = async () => {
    if (window.confirm("Really wanna delete the post?")) {
      const { data: presentData } = await supabase.storage.from("traveling").list("rents");
      const curFile = presentData.find((el) => props.image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage
        .from("traveling")
        .remove([`rents/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      await api
        .delete(`/rents/${props.id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then(async () => await refetch())
        .catch((err) => console.log(`Delete req - ${err}`));

      props.showNotification();
      setTimeout(() => {
        props.hideNotification();
      }, 3000);
    }
  };

  const loading = usersLoading || reviewsLoading;
  if (loading) return <Loading />;

  return (
    <div className="grid relative justify-items-center items-center w-[20rem] h-[15rem] grid-rows-4 border border-green-500/10 rounded-lg shadow-2xl shadow-green-600/50 hover:translate-x-2 hover:translate-y-[-.5rem] hover:shadow-green-400 hover:shadow-2xl">
      {(props.profile || admin) && (
        <FaWindowClose
          className="absolute top-5 right-5 text-red-600 hover:cursor-pointer"
          onClick={deletePost}
        />
      )}
      <img
        src={props.image}
        alt="some img"
        className="row-span-full col-span-full w-full h-full rounded-lg -z-10"
      />
      <div className="row-start-1 row-end-2 col-span-full p-2 bg-black/70 rounded-md">
        {props.name}
      </div>
      <div className="row-start-2 row-end-3 col-span-full p-2 bg-black/70 rounded-md">
        <div className="flex items-center">
          <span>{props.price}</span>
          <FaEuroSign className="mx-1" />
          <span>/ night</span>
        </div>
      </div>
      <div className="row-start-3 row-end-4 col-span-full p-2 bg-black/70 rounded-md flex items-center">
        <FaMapMarkerAlt className="mr-2" />
        <p>{props.distance} km away from you</p>
      </div>
      <div className="flex w-full justify-center [&>*]:mx-5 items-center row-start-4 row-end-5 col-span-full">
        {anyReviews ? (
          <p className="flex items-center bg-black/70 rounded-md p-2">
            <span>{getStars(props.avgRating)}</span>
            <span className="ml-2">({props.avgRating})</span>
          </p>
        ) : (
          <p className="flex items-center bg-black/70 rounded-md p-2">No reviews yet!</p>
        )}
        <FaSignInAlt
          className="bg-black/70 rounded-md p-2 text-[2.5rem] hover:cursor-pointer"
          onClick={props.showDetails}
        />
      </div>
    </div>
  );
};

export default Rent;
