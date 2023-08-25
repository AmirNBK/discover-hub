import Image, { StaticImageData } from 'next/image';
import React from 'react';
import location from '../../../assets/icons/locationTwo.svg'
import circlePlay from '../../../assets/icons/playCircle.svg'
import RatingComponent from '../RatingComponent/RatingComponent';

const PlacesCard = (props: {
    title: string
    image: StaticImageData
    rating: number
    state: string
    category: string
    address: string
    location: any
}) => {
    const title = props.title
    const image = props.image
    const rating = props.rating
    const state = props.state
    const category = props.category
    const address = props.address

    return (
        <div className={`PlacesCardContainer relative`}>
            <div className="overflow-hidden shadow-lg bg-white text-right flex flex-col justify-between h-fit"
                style={{ borderRadius: '16px', maxWidth: '22rem', height: '457px' }}
            >
                <div className='rounded-full absolute top-3.5 right-3.5 text-white px-3 py-3 text-sm flex items-center gap-x-1'
                    style={{ background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(7.5px)' }}
                >
                    <Image src={location} alt='location' unoptimized />
                    {state}
                </div>
                <div className='w-fit absolute top-3.5 left-3.5'>
                    <RatingComponent rating={rating} />
                </div>
                <Image className="w-full" src={image} alt="Sunset in the mountains" unoptimized />
                <div className='rounded-full flex items-center absolute left-2/4'
                    style={{ background: '#ffffff2e', padding: '8px', top: '30%', transform: 'translate(-50%,-50%)' }}>
                    <Image src={circlePlay} alt='circlePlay' className='w-14'
                    />
                </div>
                <div className="px-6 py-4">
                    <div className="text-xl mb-2 text-center font-normal" style={{ color: '#0C111F' }}>{title}</div>
                    <p className="text-gray-700 text-base text-left">
                        one of the best {category} of {state} that is addressed on {address}
                    </p>
                </div>
                <button className=" text-xl font-normal text-white w-fit mx-auto my-0 rounded-full mb-4"
                    style={{
                        background: 'var(--ungu, linear-gradient(135deg, #8482FF 0%, #7723FE 100%))',
                        padding: '8px 23px', fontSize: '14px'
                    }}
                >
                    See more
                </button>
            </div>
        </div>
    );
};

export default PlacesCard;