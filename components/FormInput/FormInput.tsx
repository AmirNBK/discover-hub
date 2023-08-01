import React from "react";
import styles from "./FormInput.module.css";
const FormInput = (props: { placeholder: string; label: string }) => {
  const placeholder = props.placeholder;
  const label = props.label;
  return (
    <div className={`${styles.mainContainer}`}>
      <label>{label}</label>
      <input
        className={`${styles.basicInput}`}
        type="text"
        name="smallInput"
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormInput;
