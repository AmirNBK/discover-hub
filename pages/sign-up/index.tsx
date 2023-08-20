import LoginComponent from "@/components/LoginComponent/LoginComponent";
import SignUpComponent from "@/components/SignUpComponent/SignUpComponent";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function SignUp(props: { placeholder: string }) {
    return (
        <div className="h-screen"
        >
            <SignUpComponent />
        </div>
    );
}
