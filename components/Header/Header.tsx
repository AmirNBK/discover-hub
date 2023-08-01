import React from 'react';
import logo from '../../assets/icons/mainLogo.svg'
import Image from 'next/image';

const Header = () => {
    const pages = ['Home', 'About', 'Destination', 'Contact']
    return (
        <div className='Header flex items-center justify-between'>
            <div className='Header__logoSection text-white flex flex-row items-center gap-2'>
                <Image src={logo} alt='mainLogo' className='w-12' unoptimized />
                <p className='font-extrabold'> DiscoverHub </p>
            </div>

            <div className='Header__pagesSection flex gap-6 text-white text-sm'>
                {pages.map((item: string, index: number) => {
                    return (
                        <div>
                            {index === 0 ? <p className='text-white font-bold cursor-pointer'> {item} </p> :
                                <p className='font-normal cursor-pointer' style={{ color: '#ffffff99' }}> {item} </p>}
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