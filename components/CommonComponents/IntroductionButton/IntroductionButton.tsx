import React from 'react';
import Image, { StaticImageData } from 'next/image';

const IntroductionButton = (props: {
    text: string,
    icon : StaticImageData
}) => {
    const text = props.text
    const icon = props.icon
    return (
        <button className='IntroductionButton w-fit flex gap-2 items-center rounded-full py-3 px-9 font-medium'
            style={{ background: 'var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))' }}>
            {text}
            <Image src={icon} alt='location' className='w-6' unoptimized />
        </button>
    );
};

export default IntroductionButton;