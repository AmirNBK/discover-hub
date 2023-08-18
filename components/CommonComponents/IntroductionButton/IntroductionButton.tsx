import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

const IntroductionButton = (props: {
    text: string,
    icon: StaticImageData
    link?: string
}) => {
    const text = props.text
    const icon = props.icon
    const link = props.link
    return (
        <button className='IntroductionButton w-fit flex gap-2 items-center rounded-full py-3 px-9 font-medium'
            style={{ background: 'var(--l-2, linear-gradient(135deg, #F9EC7D 0%, #F5B100 100%))' }}>
            <Link href={`${link}`} className='flex flex-row gap-2'>
                {text}
                <Image src={icon} alt='location' className='w-6' unoptimized />
            </Link>
        </button>
    );
};

export default IntroductionButton;