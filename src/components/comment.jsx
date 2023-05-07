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
    <div className="grid grid-row-1 grid-cols-[3fr,6fr,1fr] items-center py-2 border-b border-green-600 w-[35rem]">
      <div className="flex items-center">
        <img
          src={props.profilePicture}
          alt="profile pic"
          className="w-auto h-auto max-w-[3rem] max-h-[3rem] rounded-md"
        />
        <p className="ml-2 text-green-400 font-bold">{props.fullName}</p>
      </div>
      <p className="ml-5 text-[0.8rem]">{props.message}</p>
      {props.userID === curUsername && (
        <FaTrash className="hover:cursor-pointer" onClick={deleteComment} />
      )}
    </div>
  );
};

export default Comment;
