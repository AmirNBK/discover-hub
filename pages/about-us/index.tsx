import { Inter } from 'next/font/google'
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';
import Header from '@/components/Header/Header';
import AboutUsHeroSection from '@/components/AboutUsHeroSection/AboutUsHeroSection';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <div className={`AboutUs flex min-h-screen flex-col items-center ${inter.className}`} style={{ background: '#0C111F' }}>
            <PrimeReactProvider>
                <div className='HeroSection w-full py-5 px-20' style={{ background: '#0C111F', fontFamily: 'Inter' }}>
                    <Header />
                </div>
                <AboutUsHeroSection />
                <WhyChooseUs />
            </PrimeReactProvider>
        </div>
    )
}
