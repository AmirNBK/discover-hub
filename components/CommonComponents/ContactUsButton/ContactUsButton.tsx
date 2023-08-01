import React from "react";

const ContactUsButton = (props: { text: string }) => {
  const text = props.text;
  return (
    <button
      className="IntroductionButton w-fit flex gap-2 items-center rounded-full py-3 px-9 font-medium"
      style={{
        background:
          "var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))",
      }}
    >
      {text}
    </button>
  );
};

export default ContactUsButton;
