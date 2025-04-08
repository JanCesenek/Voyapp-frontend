import React from "react";
import {
  FaMapMarkerAlt,
  FaGrinHearts,
  FaFrown,
  FaComment,
  FaWindowClose,
  FaSignInAlt,
} from "react-icons/fa";
import { useUpdate } from "../hooks/use-update";
import Loading from "./loading";

const Destination = (props) => {
  const { data: usersData, isLoading: usersLoading } = useUpdate("/users");
  const { data: likesData, isLoading: likesLoading } = useUpdate("/likes");
  const { data: dislikesData, isLoading: dislikesLoading } = useUpdate("/dislikes");
  const { data: commentsData, isLoading: commentsLoading } = useUpdate("/comments");
  const curUsername = localStorage.getItem("curUser");
  const curUser = usersData?.find((el) => el.username === curUsername);
  const admin = curUser?.admin;

  const likeCount = () => {
    let count = 0;
    likesData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const dislikeCount = () => {
    let count = 0;
    dislikesData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const commentCount = () => {
    let count = 0;
    commentsData?.map((el) => {
      if (el.postID === props.id) count++;
    });
    return count;
  };

  const loading = likesLoading || dislikesLoading || commentsLoading || usersLoading;
  if (loading) return <Loading />;

  return (
    <div className="grid relative justify-items-center items-center w-[20rem] h-[15rem] grid-rows-4 grid-cols-4 rounded-lg shadow-xl shadow-black hover:translate-x-2 hover:translate-y-[-.5rem] hover:shadow-green-400 bg-black/50 [&>*]:hover:bg-black/70">
      {(props.profile || admin) && (
        <FaWindowClose
          className="absolute top-2 right-2 text-red-600 hover:cursor-pointer opacity-50 text-[0.8rem] hover:opacity-100"
          onClick={props.deletePost}
        />
      )}
      <img
        src={props.image}
        alt="some img"
        className="row-span-full col-span-full w-full h-full rounded-lg -z-10"
      />
      <div className="row-start-1 row-end-2 col-span-full p-2 rounded-md text-[1.7rem]">
        {props.name}
      </div>
      <div className="row-start-2 row-end-3 col-span-full p-2 rounded-md text-[0.6rem]">
        {props.ownerFullName}
      </div>
      {props.distance && (
        <div className="row-start-3 row-end-4 col-span-full p-2 rounded-md flex items-center text-[1.2rem]">
          <FaMapMarkerAlt className="mr-2" />
          <p>{props.distance} km away from you</p>
        </div>
      )}
      <div className="flex items-center row-start-4 row-end-5 col-start-1 col-end-2 rounded-md p-2">
        <FaGrinHearts className="mr-2" />
        <p>{likeCount()}</p>
      </div>
      <div className="flex items-center row-start-4 row-end-5 col-start-2 col-end-3 rounded-md p-2">
        <FaFrown className="mr-2" />
        <p>{dislikeCount()}</p>
      </div>
      <div className="flex items-center row-start-4 row-end-5 col-start-3 col-end-4 rounded-md p-2">
        <FaComment className="mr-2" />
        <p>{commentCount()}</p>
      </div>
      <div className="flex items-center row-start-4 row-end-5 col-start-4 col-end-5 rounded-md p-2">
        <FaSignInAlt className="hover:cursor-pointer text-[1.7rem]" onClick={props.showDetails} />
      </div>
    </div>
  );
};

export default Destination;
