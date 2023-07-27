import React from 'react';
import pic from '../../assets/images/WomanPic.jpg'
import Image from 'next/image';
import IntroductionButton from '../CommonComponents/IntroductionButton/IntroductionButton';
import arrow from '../../assets/icons/arrow.svg'

const AboutUsHeroSection = () => {
    return (
        <div className='AboutUsHeroSection w-full px-20 my-20 flex flex-row gap-x-20'>
            <div className='AboutUsHeroSection__Infos flex flex-col gap-10 w-full translate-y-40 w-3/5'>
                <h3 className='text-5xl font-semibold text-white'>
                    We just made finding everything easier
                </h3>
                <h4 className='text-base font-medium text-white'>
                Whether you're at home or on the go, finding your next adventure is now simpler than ever. With just a click or a touch, unlock a world of possibilities and uncover nearby wonders waiting to be explored.
                </h4>
                <IntroductionButton text='Get started' icon={arrow} />
            </div>

            <div className='AboutUsHeroSection__pic relative'>
                <div className='absolute' style={{ width: '375px', height: '500px', background: '#D0EDF9' , zIndex : '0' }}>
                </div>
                <div className='relative' style={{zIndex : '1' , transform : 'translate(-50px,50px)'}}>
                    <Image src={pic} alt='womanPic' style={{ width: '450px'  }} />
                </div>
            </div>
        </div>
    );
};

export default AboutUsHeroSection;