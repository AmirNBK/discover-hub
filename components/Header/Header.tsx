import React from 'react';
import logo from '../../assets/icons/mainLogo.svg'
import Image from 'next/image';
import Link from 'next/link';

const Header = (props: {
    active: string
}) => {
    const active = props.active
    const pages = [
        { title: 'Home', link: '/' },
        { title: 'Map', link: '/map' },
        { title: 'About', link: '/about-us' },
        { title: 'Contact', link: '/contact-us' }
    ];
    return (
        <div className='Header flex items-center justify-between' style={{zIndex : '3000000000'}}>
            <Link href={'/'} className='Header__logoSection text-white flex flex-row items-center gap-2'>
                <Image src={logo} alt='mainLogo' className='w-12' unoptimized />
                <p className='font-extrabold'> DiscoverHub </p>
            </Link>

            <div className='Header__pagesSection flex gap-6 text-white text-sm'>
                {pages.map((item: { title: string; link: string }, index: number) => {
                    return (
                        <div className='cursor-pointer'>
                            <Link href={item.link} className={` ${item.title === active ? 'font-bold' : 'font-normal'}`}
                                style={{ color: item.title === active ? '#fff' : '#ffffff99' }}> {item.title} </Link>
                        </div>
                    )
                })}
            </div>

            <div className='Header__signInSection flex items-center gap-4'>
                <p className='text-white text-sm'> Register </p>
                <button className='bg-white font-bold rounded-full py-2	px-8'> Login </button>
            </div>
        </div>
    );
};

export default Header;