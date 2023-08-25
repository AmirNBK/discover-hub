import LoginComponent from "@/components/LoginComponent/LoginComponent";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { ReactNode } from "react";

export default function Login(props: { placeholder: string }) {
    return (
        <div className="h-screen"
        >
            <LoginComponent />
        </div>
    );
}
