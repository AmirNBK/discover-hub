import React from 'react';
import ChooseUsComponent from '../ChooseUsComponent/ChooseUsComponent';
import navigation from '../../assets/icons/navigation.svg'
import nearby from '../../assets/icons/nearby.png'
import realTime from '../../assets/icons/real-time.svg'
import map from '../../assets/icons/map.svg'

const features = [
    {
        title: 'Navigate easily',
        description: 'Thanks to our real-time location tracking Navigation has never been smoother and you have access to the best nearby attractions.',
        icon: navigation,
    },
    {
        title: 'Explore nearby',
        description: 'Powered by state-of-the-art algorithms, ExploreNearby brings you an unrivaled selection of nearby attractions, hotels, and hidden gems.',
        icon: nearby,
    },
    {
        title: 'Real-Time Location',
        description: 'Stay informed with real-time tracking, providing instant access to nearby points of interest as you move.',
        icon: realTime,
    },
    {
        title: 'Personalized Recommendations',
        description: 'Receive tailored suggestions based on your interests and preferences, ensuring you discover places that resonate with you.',
        icon: map,
    },
];

const WhyChooseUs = () => {
    return (
        <div className='WhyChooseUs text-white items-center my-20 px-20'>
            <h2 className='text-center text-5xl'> Why choose us </h2>
            <p className='text-center w-3/4 my-0 mx-auto mt-6'>
                thank you for considering us as your location finder , we believe that we are responsible for making the best experience possible for our users that can interact and have an unforgettable experience
            </p>
            <div className='whyChooseUsSection my-10 flex flex-row flex-wrap justify-around gap-16'>
                {features.map((feature, index) => (
                    <ChooseUsComponent
                        key={index}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                    />
                ))}
            </div>
        </div>
    );
};

export default WhyChooseUs;
