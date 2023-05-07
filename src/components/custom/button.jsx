import React from "react";

const Button = (props) => {
  return (
    <button
      className={`px-2 border border-white rounded-md bg-green-800 bg-opacity-40 text-[1.5rem] ${
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
