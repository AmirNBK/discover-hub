import { Inter } from 'next/font/google'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <div className={`ContactUs flex min-h-screen flex-col items-center ${inter.className}`} style={{ background: '#0C111F' }}>

        </div>
    )
}
