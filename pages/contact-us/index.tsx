import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import FormInput from "../../components/FormInput/FormInput";
import profile from '../../assets/icons/profile.svg'
import Image from "next/image";
import mapPic from "../../assets/images/mapsicleMap.png";
import TextArea from "@/components/TextArea/TextArea";
import marker from '../../assets/icons/marker.svg'
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function ContactUs(props: { placeholder: string }) {
    return (
        <div
            className={`ContactUs flex min-h-screen flex-col items-center ${inter.className}`}
            style={{ background: "#343333" }}
        >
            <div className='HeroSection w-full pt-5 px-20' style={{ fontFamily: 'Inter' }}>
                <Header active="Contact" />
            </div>
            <div
                className="flex items-center justify-between pl-6 sm:pl-12 my-6 sm:my-24 sm:bg-black-primary"
                style={{
                    height: '700px',
                    borderRadius: "8px",
                }}
            >
                <div
                    style={{ width: "100%" }}
                    className="flex flex-col items-baseline gap-y-6"
                >
                    <p style={{ color: "#FFFFFF" }} className="text-3xl">
                        Get in touch with us
                    </p>

                    <div className="flex flex-row gap-x-4 items-center">
                        <Image src={profile} alt="profile" width={50} height={50} />
                        <p className="text-white rounded-md text-xs p-2"
                            style={{ border: '1px solid #5A5A5A', width: '70%' }}
                        > Hi, I’m Amanda. Need help? Use the form below or email me at hello@california_golfclub.org. </p>
                    </div>
                    <FormInput placeholder={"Full Name"} label={"Name"} />
                    <FormInput placeholder={"Email Address"} label={"Email"} />
                    <TextArea />
                    <button style={{ background: 'var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))' }}
                        className="rounded-sm px-12 py-3 text-black">
                        Send my message
                    </button>
                </div>
                <div className="w-full h-full relative lg:block hidden">
                    <Image alt="marker" src={marker} width={45} unoptimized className="left-1/2 top-1/2 absolute"/>
                    <Image
                        alt="mapPic"
                        src={mapPic}
                        unoptimized
                        className="w-full h-full"
                        style={{
                            borderRadius: "0px 8px 8px 0px",
                        }}
                    />
                </div>
            </div>

            <div className='w-full'>
                <Footer />
            </div>
        </div>
    );
}
