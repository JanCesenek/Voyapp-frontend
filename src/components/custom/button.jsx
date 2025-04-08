import React from "react";

const Button = (props) => {
  return (
    <button
      className={`px-2 border border-green-700/50 rounded-md bg-green-800/40 shadow-md shadow-black text-[1.5rem] ${
        props.classes ? props.classes : undefined
      }`}
      type={props.submit ? "submit" : "button"}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.title}
    </button>
  );
};

export default Button;
