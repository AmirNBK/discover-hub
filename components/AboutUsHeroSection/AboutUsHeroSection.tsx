import React from 'react';
import pic from '../../assets/images/WomanPic.jpg'
import Image from 'next/image';
import IntroductionButton from '../CommonComponents/IntroductionButton/IntroductionButton';
import arrow from '../../assets/icons/arrow.svg'

const AboutUsHeroSection = () => {
    return (
        <div className='AboutUsHeroSection w-full px-6 sm:px-20 my-10 sm:my-20 flex xl:flex-row flex-col gap-20'>
            <div className='AboutUsHeroSection__Infos flex flex-col gap-8 sm:gap-10 w-full xl:translate-y-40 w-3/5'>
                <h3 className='text-2xl sm:text-5xl font-semibold xl:text-left text-center text-white'>
                    We just made finding everything easier
                </h3>
                <h4 className='text-sm sm:text-base font-medium text-white xl:text-left text-center'>
                    Whether you're at home or on the go, finding your next adventure is now simpler than ever. With just a click or a touch, unlock a world of possibilities and uncover nearby wonders waiting to be explored.
                </h4>
                <div className='flex justify-center xl:justify-start'>
                    <IntroductionButton text='Get started' icon={arrow} />
                </div>
            </div>

            <div className='xl:hidden block mx-auto'>
                <Image src={pic} alt='womanPic' style={{ width: '450px' }} />
            </div>

            <div className='AboutUsHeroSection__pic relative xl:block hidden'>
                <div className='absolute' style={{ width: '375px', height: '500px', background: '#D0EDF9', zIndex: '0' }}>
                </div>
                <div className='relative' style={{ zIndex: '1', transform: 'translate(-50px,50px)' }}>
                    <Image src={pic} alt='womanPic' style={{ width: '450px' }} />
                </div>
            </div>
        </div>
    );
};

export default AboutUsHeroSection;