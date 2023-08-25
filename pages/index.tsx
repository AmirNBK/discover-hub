import { useState, useEffect } from 'react'
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
import Footer from '@/components/Footer/Footer'
import CommentSection from '@/components/CommentSection/CommentSection'
import { fetchUserLocationAndData } from '../components/fetchLocations/fetchLocations'

const inter = Inter({ subsets: ['latin'] })

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Venue {
  fsq_id: string;
  name: string;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
}

export default function Home() {

  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [data, setData] = useState<Venue[]>([]);

  useEffect(() => {
    fetchUserLocationAndData(setUserLocation, setData);
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between bg-white ${inter.className}`}
    >
      <PrimeReactProvider>
        <div className='HeroSection w-full pt-5 px-20' style={{ background: '#0C111F', fontFamily: 'Inter' }}>
          <Header active='Home' />
          <Introduction />
        </div>
        <FeaturesSection />
        <MostPopularSection data={data} />
        <div className='HeroSection w-full pt-5 px-20' style={{ background: '#0C111F', fontFamily: 'Inter' }}>
          <BestLocationSection />
        </div >
        <div style={{ background: '#F7F7F7' }} className='w-full'>
          <CommentSection />
        </div>
        <div className='w-full'>
          <Footer />
        </div>
      </PrimeReactProvider>
    </main>
  )
}
