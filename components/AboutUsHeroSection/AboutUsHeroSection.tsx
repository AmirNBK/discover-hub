import React from 'react';
import pic from '../../assets/images/WomanPic.jpg'
import Image from 'next/image';
import IntroductionButton from '../CommonComponents/IntroductionButton/IntroductionButton';
import arrow from '../../assets/icons/arrow.svg'

const AboutUsHeroSection = () => {
    return (
        <div className='AboutUsHeroSection w-full px-20 my-20 flex flex-row gap-x-20'>
            <div className='AboutUsHeroSection__Infos flex flex-col gap-8 w-full translate-y-40 w-3/5'>
                <h3 className='text-5xl font-semibold text-white'>
                    We just made finding everything easier
                </h3>
                <h4 className='text-lg font-medium text-white'>
                    anywhere you are, any place you wanna find is just a click or touch , and we always care to our customers with our 24/7 support
                </h4>
                <IntroductionButton text='Get started' icon={arrow} />
            </div>

            <div className='AboutUsHeroSection__pic relative'>
                <div className='absolute' style={{ width: '430px', height: '500px', background: '#D0EDF9' , zIndex : '0' }}>
                </div>
                <div className='relative' style={{zIndex : '1' , transform : 'translate(-50px,50px)'}}>
                    <Image src={pic} alt='womanPic' style={{ width: '450px'  }} />
                </div>
            </div>
        </div>
    );
};

export default AboutUsHeroSection;