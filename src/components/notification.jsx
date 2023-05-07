import React from "react";
import { FaCheckSquare, FaWindowClose, FaEdit } from "react-icons/fa";
import classes from "./notification.module.css";

const Notification = (props) => {
  return (
    <div
      className={`absolute top-[15rem] flex text-[1.3rem] items-center justify-center p-2 bg-gradient-to-b from-black/50 to-green-500/30 rounded-lg shadow-black/50 shadow-lg !w-[20rem] ${classes.animation} ${props.className}`}
      onClick={props.onClick}>
      <p className="mr-2">{props.message}</p>
      {props.post && <FaCheckSquare />}
      {props.patch && <FaEdit />}
      {props.delete && <FaWindowClose />}
    </div>
  );
};

export default Notification;
