import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import FormInput from "../../components/FormInput/FormInput";

import Image from "next/image";
import mapPic from "../../assets/images/mapsicleMap.png";
import TextArea from "@/components/TextArea/TextArea";
import ContactUsButton from "@/components/CommonComponents/ContactUsButton/ContactUsButton";

export default function ContactUs(props: { placeholder: string }) {
  return (
    <div
      className={`ContactUs flex min-h-screen flex-col items-center ${inter.className}`}
      style={{ background: "#0C111F" }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          width: "70%",
          height: "36rem",
          backgroundColor: "#343333",
          borderRadius: "8px",
        }}
      >
        <div
          style={{ width: "100%", alignItems: "center" }}
          className="column ,flex ,center"
        >
          <p style={{ color: "#FFFFFF", fontSize: "36px" }}>
            Get in touch with us
          </p>
          <FormInput placeholder={"Full Name"} label={"Enter your name"} />
          <FormInput placeholder={"Email Address"} label={"Enter your email"} />
          <TextArea />
          <ContactUsButton text="Send" />
        </div>
        <div style={{ width: "100%" }}>
          <Image
            src={mapPic}
            style={{
              width: "100%",
              height: "36rem",
              borderRadius: "0px 8px 8px 0px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
