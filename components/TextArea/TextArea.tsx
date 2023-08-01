import React from "react";
import styles from "./TextArea.module.css";
const TextArea = () => {
  return (
    <div className="flex flex-col item-baseline">
      <label style={{ color: '#CCC6C6' }} className="text-base">Write your Message</label>
      <textarea
        className={`${styles.textarea} mt-2 placeholder:text-sm`}
        name="smallInput"
        placeholder="Enter your description here"
      />
    </div>
  );
};

export default TextArea;
