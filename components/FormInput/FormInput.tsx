import React from "react";
import styles from "./FormInput.module.css";
const FormInput = (props: { placeholder: string; label: string }) => {
  const placeholder = props.placeholder;
  const label = props.label;
  return (
    <div className={`${styles.mainContainer} flex flex-col items-baseline`}>
      <label style={{ color: '#CCC6C6' }} className="text-base">{label}</label>
      <input
        className={`${styles.basicInput} mt-2 placeholder:text-sm`}
        type="text"
        name="smallInput"
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormInput;
