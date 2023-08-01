import React from "react";
import styles from "./TextArea.module.css";
const TextArea = () => {
  return (
    <div>
      <label>Write your Message</label>
      <textarea
        className={`${styles.textarea}`}
        name="smallInput"
        placeholder="Enter your description here"
      />
    </div>
  );
};

export default TextArea;
