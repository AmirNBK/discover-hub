import Image from 'next/image'
import { Inter } from 'next/font/google'
import Header from '@/components/Header/Header'
import Introduction from '@/components/Introduction/Introduction'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <div className='HeroSection w-full pt-5 px-20' style={{ background: '#0C111F' , fontFamily : 'Inter' }}>
        <Header />
        <Introduction />
      </div>
    </main>
  )
}
