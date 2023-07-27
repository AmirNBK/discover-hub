import Image, { StaticImageData } from 'next/image';
import React from 'react';

const ChooseUsComponent = (props : {
    title : string
    description : string
    icon : StaticImageData
}) => {
    const title = props.title
    const description = props.description
    const icon = props.icon
    return (
        <div className='ChooseUsComponent w-fit rounded-md p-3.5 relative max-w-xl' style={{background : '#F2F2F3'}}>
            <Image src={icon} alt='icon' className='w-14 absolute' style={{top : '-35px'}}/>
            <h2 className='text-black text-2xl mb-4 mt-6 font-semibold'> {title} </h2>
            <p className='text-black text-sm'> {description} </p>
        </div>
    );
};

export default ChooseUsComponent;