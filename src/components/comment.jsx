import React from "react";
import { useUpdate } from "../hooks/use-update";
import { api } from "../core/api";
import { FaTrash } from "react-icons/fa";

const Comment = (props) => {
  const curUsername = localStorage.getItem("curUser");
  const token = localStorage.getItem("token");
  const { refetch } = useUpdate("/comments");
  const deleteComment = async () => {
    await api
      .delete(`/comments/${props.id}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then(async () => await refetch())
      .catch((err) => console.log(`Delete req - ${err}`));
  };

  return (
    <div className="relative flex flex-col items-center py-2 bg-gradient-to-b from-black/50 to-green-700/50 w-[35rem] shadow-lg shadow-black/50 rounded-lg my-5">
      <div className="flex justify-center items-center py-5 w-full border-b border-green-500">
        <img
          src={props.profilePicture}
          alt="profile pic"
          className="w-auto h-auto max-w-[3rem] max-h-[3rem] rounded-md"
        />
        <p className="ml-2 text-green-400 font-bold">{props.fullName}</p>
      </div>
      <p className="my-5 px-5 text-[0.8rem]">{props.message}</p>
      {props.userID === curUsername && (
        <FaTrash className="hover:cursor-pointer absolute top-5 right-5" onClick={deleteComment} />
      )}
    </div>
  );
};

export default Comment;
