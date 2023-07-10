import Image from 'next/image';
import React from 'react';
import viewImage from '../../assets/images/beatifulView.png'
import location from '../../assets/icons/locationTwo.svg'
import FeatureContainer from './FeatureContainer/FeatureContainer';
import users from '../../assets/icons/3User.svg'

const FeaturesSection = () => {
    return (
        <div className='FeaturesSection w-full flex px-20 my-10'>
            <div className='FeaturesSection__leftSection flex flex-col flex-1 gap-y-5'>
                <h2
                    className='text-4xl font-bold w-8/12'
                    style={{ color: '#0C111F', lineHeight: '180%' }}
                > Get Experience Which are fun </h2>
                <p
                    className='font-normal'
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

            <div className='FeaturesSection__rightSection'
                style={{ flex: '1.5' }}
            >
                <FeatureContainer title='Affordable prices' description='We provide some very affordable prices compared to others.' icon={users} bgColor='var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))' />
            </div>
        </div>
    );
};

export default FeaturesSection;