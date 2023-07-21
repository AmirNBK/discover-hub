import Image from 'next/image';
import React from 'react';
import lines from '../../assets/images/lines.png'
import IntroductionButton from '../CommonComponents/IntroductionButton/IntroductionButton';
import image from '../../assets/images/beatifulView2.png'
import call from '../../assets/icons/call.svg'

const BestLocationSection = () => {
    return (
        <div className='BestLocationSection my-12 flex flex-row z-10 relative'>
            <div className='Introduction__info my-12 flex flex-col gap-8 flex-1'>
                <Image src={lines} alt='lines' className='absolute top-2/4 left-2/4 h-full'
                    style={{ zIndex: '-1', transform: 'translate(-50%, -50%)' }}
                />
                <h3 className='text-white text-6xl font-extrabold leading-tight'>
                    We are ready to provide the best locations
                </h3>
                <p className='text-lg' style={{ color: '#ffffffb3' }}>
                    We have a variety of the world's best locations that you can choose as your next destination
                </p>
                <div className='flex flex-row'>
                    <IntroductionButton text='Contact Now' icon={call} />
                </div>
            </div>

            <div className=' Introduction__pic' style={{ flex: '1.8' }}>
                <Image src={image} alt='picture' className='my-0 mx-auto' />
            </div>
        </div>
    );
};

export default BestLocationSection;