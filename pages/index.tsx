import { Inter } from 'next/font/google'
import Header from '@/components/Header/Header'
import Introduction from '@/components/Introduction/Introduction'
import FeaturesSection from '@/components/FeaturesSection/FeaturesSection'
import MostPopularSection from '@/components/MostPopularSection/MostPopularSection'
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';
import BestLocationSection from '@/components/BestLocationSection/BestLocationSection'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between bg-white ${inter.className}`}
    >
      <PrimeReactProvider>
        <div className='HeroSection w-full pt-5 px-20' style={{ background: '#0C111F', fontFamily: 'Inter' }}>
          <Header />
          <Introduction />
        </div>
        <FeaturesSection />
        <MostPopularSection />
        <div className='HeroSection w-full pt-5 px-20' style={{ background: '#0C111F', fontFamily: 'Inter' }}>
          <BestLocationSection />
        </div >
      </PrimeReactProvider>
    </main>
  )
}
