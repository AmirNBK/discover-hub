import React from 'react';
import rate from '../../../assets/icons/rateStart.svg'
import Image from 'next/image';
import star from '../../../assets/icons/Star.svg'

const RatingComponent = (props: {
    rating: number
}) => {
    const rating = props.rating
    return (
        <div className='RatingComponent flex flex-row-reverse text-white rounded-full items-center'
            style={{
                background: 'rgba(12, 17, 31, 0.34)', boxShadow: '7px 0px 20px 0px rgba(255, 255, 255, 0.15) inset', backdropFilter: 'blur(4px)',
                gap: '11px', padding: '6px 13px 6px 8px'
            }}>
            {rating}
            <div className='rounded-full p-2' style={{
                background: 'var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))',
                boxShadow: '4px 8px 20px 0px rgba(0, 0, 0, 0.15), 7px 0px 20px 0px rgba(255, 255, 255, 0.15) inset;'
            }}>
                <Image src={star} alt='star' />
            </div>
        </div>
    );
};

export default RatingComponent;