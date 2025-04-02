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
import supabase from "../core/supabase";
import { api } from "../core/api";

const Destination = (props) => {
  const { data: usersData, isLoading: usersLoading } = useUpdate("/users");
  const { data: likesData, isLoading: likesLoading } = useUpdate("/likes");
  const { data: dislikesData, isLoading: dislikesLoading } = useUpdate("/dislikes");
  const { data: commentsData, isLoading: commentsLoading } = useUpdate("/comments");
  const { refetch } = useUpdate("/destinations");
  const token = localStorage.getItem("token");
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

  const deletePost = async () => {
    if (window.confirm("Really wanna delete the post?")) {
      const { data: presentData } = await supabase.storage.from("traveling").list("destinations");
      const curFile = presentData.find((el) => props.image.includes(el.name));
      console.log(curFile);
      const { data, error } = await supabase.storage
        .from("traveling")
        .remove([`destinations/${curFile.name}`]);

      if (error) {
        console.log("Error deleting file", error);
      } else {
        console.log("File successfully deleted!", data);
      }

      await api
        .delete(`/destinations/${props.id}`, {
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

  const loading = likesLoading || dislikesLoading || commentsLoading || usersLoading;
  if (loading) return <Loading />;

  return (
    <div className="grid relative justify-items-center items-center w-[20rem] h-[15rem] grid-rows-3 grid-cols-4 border border-green-500/10 rounded-lg shadow-2xl shadow-green-600/50 hover:translate-x-2 hover:translate-y-[-.5rem] hover:shadow-green-400 hover:shadow-2xl">
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
        {props.name} {!props.profile && `with ${props.ownerFullName}`}
      </div>
      {props.distance && (
        <div className="row-start-2 row-end-3 col-span-full p-2 bg-black/70 rounded-md flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          <p>{props.distance} km away from you</p>
        </div>
      )}
      <div className="flex items-center row-start-3 row-end-4 col-start-1 col-end-2 bg-black/70 rounded-md p-2">
        <FaGrinHearts className="mr-2" />
        <p>{likeCount()}</p>
      </div>
      <div className="flex items-center row-start-3 row-end-4 col-start-2 col-end-3 bg-black/70 rounded-md p-2">
        <FaFrown className="mr-2" />
        <p>{dislikeCount()}</p>
      </div>
      <div className="flex items-center row-start-3 row-end-4 col-start-3 col-end-4 bg-black/70 rounded-md p-2">
        <FaComment className="mr-2" />
        <p>{commentCount()}</p>
      </div>
      <div className="flex items-center row-start-3 row-end-4 col-start-4 col-end-5 bg-black/70 rounded-md p-2">
        <FaSignInAlt className="hover:cursor-pointer text-[1.7rem]" onClick={props.showDetails} />
      </div>
    </div>
  );
};

export default Destination;
