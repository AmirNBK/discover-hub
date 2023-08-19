import Image from 'next/image';
import React from 'react';

const FeatureContainer = (props: {
    title: string, description: string, icon: any
}) => {
    const title = props.title
    const description = props.description
    const icon = props.icon
    return (
        <div className='FeatureContainer flex lg:flex-row flex-col lg:m-0 mx-auto mt-6
        lg:text-left text-center items-center gap-x-10 justify-center pb-5 w-fit'
            style={{ borderBottom: '1px solid #F7F7F7' }}
        >
            <div>
                <Image src={icon} alt={icon} className='w-14' unoptimized />
            </div>
            <div className='flex flex-col gap-y-3 lg:items-baseline items-center'>
                <h3 className='font-bold text-xl capitalize'> {title} </h3>
                <p className='text-lg font-light w-10/12'> {description} </p>
            </div>
        </div>
    );
};

export default FeatureContainer;