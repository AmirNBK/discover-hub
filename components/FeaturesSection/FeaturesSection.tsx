import Image from 'next/image';
import React from 'react';
import viewImage from '../../assets/images/beatifulView.png'
import location from '../../assets/icons/locationTwo.svg'
import FeatureContainer from './FeatureContainer/FeatureContainer';
import users from '../../assets/icons/3User.svg'
import wallet from '../../assets/icons/Wallet.svg'
import heart from '../../assets/icons/Heart.svg'

const FeaturesSection = () => {
    return (
        <div className='FeaturesSection w-full flex px-10 my-10 gap-x-20'>
            <div className='FeaturesSection__leftSection flex flex-col flex-1 gap-y-5'>
                <h2
                    className='text-4xl font-bold w-8/12'
                    style={{ color: '#0C111F', lineHeight: '180%' }}
                > Get Experience Which are fun </h2>
                <p
                    className='font-normal w-10/12'
                    style={{ color: '#0C111F', opacity: '0.6000000238418579' }}
                >
                    With DiscoverHub you can get the best experience on holiday travel, and we always update the latest and best destinations in the world
                </p>
                <div className='relative'>
                    <div className='rounded-full absolute top-3.5 left-3.5 text-white px-3 py-3 text-sm flex items-center gap-x-1'
                        style={{ background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(7.5px)' }}
                    >
                        <Image src={location} alt='location' />
                        Mazandaran
                    </div>
                    <Image src={viewImage} alt='view' />
                </div>
            </div>

            <div className='FeaturesSection__rightSection flex flex-col justify-around flex-1'
            >
                <FeatureContainer title='Affordable prices' description='We provide some very affordable prices compared to others.' icon={wallet} />
                <FeatureContainer title='Unforgettable experience' description='We provide a vacation experience that will be unforgettable.' icon={users} />
                <FeatureContainer title='Very Friendly Service' description='We will provide excellent and friendly service for the sake of our customers.' icon={heart} />
            </div>
        </div>
    );
};

export default FeaturesSection;