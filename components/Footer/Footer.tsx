import React from 'react';
import logo from '../../assets/icons/mainLogo.svg';
import facebook from '../../assets/icons/facebook.svg';
import twitter from '../../assets/icons/twitter.svg';
import instagram from '../../assets/icons/instagram.svg';
import Image from 'next/image';

interface FooterItem {
    icon: any;
    text: string;
}

const Footer = () => {
    const footerInfo: { title: string; items: (string | FooterItem)[] }[] = [
        {
            title: 'Destination',
            items: ['Cappadocia', 'Sossusvlei', 'Albuquera'],
        },
        {
            title: 'About',
            items: ['Contact Us', 'Testimoni', 'Rating'],
        },
        {
            title: 'Follow Us',
            items: [
                { icon: facebook, text: 'Facebook' },
                { icon: twitter, text: 'Twitter' },
                { icon: instagram, text: 'Instagram' },
            ],
        },
    ];

    return (
        <div className='Footer bg-white px-20 py-20'>
            <div className='Footer__company flex justify-between'>
                <div className='Footer__logoSection flex flex-col gap-3'>
                    <div className='flex flex-row items-center gap-2'>
                        <Image src={logo} alt='mainLogo' className='w-12' />
                        <p className='font-extrabold text-black'> DiscoverHub </p>
                    </div>
                    <p
                        className='font-normal text-sm h-3/6 overflow-hidden'
                        style={{ color: '#0C111F', opacity: '0.6000000238418579', display: '-webkit-box', WebkitLineClamp: 2 }}
                    >
                        With travala you can experience new travel and the best tourist destinations that we have to offer
                    </p>
                </div>

                {footerInfo.map((info, index) => (
                    <div className='Footer__info' key={index}>
                        <h4 className='Footer__info__title font-bold mb-4'>{info.title}</h4>
                        <div className='flex flex-col gap-2'>
                            {info.items.map((item, idx) => (
                                <div key={idx} className='flex flex-row gap-3'>
                                    {typeof item !== 'string' && item.icon && <Image src={item.icon} alt={item.text} />}
                                    <h4 className='text-sm'>{typeof item === 'string' ? item : item.text}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Footer;
