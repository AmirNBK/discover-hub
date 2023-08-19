import React from 'react';
import IntroductionButton from '../CommonComponents/IntroductionButton/IntroductionButton';
import Image from 'next/image';
import circlePlay from '../../assets/icons/playCircle.svg'
import pic from '../../assets/images/Traveller.png'
import lines from '../../assets/images/lines.png'
import location from '../../assets/icons/location.svg'

const Introduction = () => {
    
    return (
        <div className='Introduction my-6 xl:my-12 flex flex-row z-10 relative'>
            <div className='Introduction__info my-12 flex flex-col gap-8 flex-1'>
                <Image src={lines} alt='lines' className='absolute top-2/4 left-2/4'
                    style={{ zIndex: '-1', transform: 'translate(-50%, -50%)' }} unoptimized
                />
                <p style={{ color: '#E97458' }} className='text-center xl:text-left text-xs sm:text-base font-bold uppercase'>
                    the best deals on the world's best destinations
                </p>
                <h3 className='text-center xl:text-left text-white text-4xl sm:text-7xl' style={{ fontFamily: 'Volkhov' }}>
                    Best travel and destinations
                </h3>
                <p className='text-center xl:text-left text-base' style={{ color: '#ffffffb3' }}>
                    With travala you can experience new travel and the best tourist destinations that we have to offer
                </p>
                <div className='flex flex-col gap-2 sm:gap-0 sm:m-0 mx-auto sm:items-center sm:flex-row justify-center xl:justify-start '>
                    <IntroductionButton link='/map' text='Our Location' icon={location} />
                    <div className='flex flex-row items-center mt-3 justify-center sm:ml-10'
                    >
                        <div className='rounded-full flex items-center text-xs sm:text-base'
                            style={{ background: '#ffffff2e', padding: '8px' }}>
                            <Image src={circlePlay} alt='circlePlay' unoptimized
                            />
                        </div>
                        <p className='text-white ml-1 sm:ml-2 sm:text-base'> Our Gallery </p>
                    </div>
                </div>
            </div>

            <div className=' Introduction__pic hidden xl:block' style={{ flex: '1.8' }}>
                <Image src={pic} alt='picture' className='my-0 mx-auto' unoptimized />
            </div>
        </div>
    );
};

export default Introduction;