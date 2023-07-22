import React from 'react';
import pic from '../../assets/images/WomanPic.jpg'
import Image from 'next/image';

const AboutUsHeroSection = () => {
    return (
        <div className='AboutUsHeroSection w-full px-20 my-20 flex flex-row'>
            <div className='AboutUsHeroSection__Infos flex flex-col gap-6 w-full'>
                <h3 className='text-5xl font-semibold'>
                    We just made finding everything easier
                </h3>
                <h4 className='text-xl'>
                    anywhere you are, any place you wanna find is just a click or touch , and we always care to our customers with our 24/7 support
                </h4>
            </div>

            <div className='AboutUsHeroSection__pic'>
                <Image src={pic} alt='womanPic' style={{width : '550px'}} />
            </div>
        </div>
    );
};

export default AboutUsHeroSection;