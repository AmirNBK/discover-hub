import { Carousel } from 'primereact/carousel';
import React from 'react';
import PlacesCard from '../CommonComponents/PlacesCard/PlacesCard';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import image from '../../assets/images/image1.png'

const MostPopularSection = () => {
    interface Informations {
        location: string;
        rating: number;
        City: string;
        description: string;
    }

    const locations: Informations[] = [
        {
            location: 'Gilan',
            rating: 5,
            City: 'Rasht',
            description: 'One of the most beautiful places that you can find in iran , a paradise you can never imagine',
        },
        {
            location: 'Gilan',
            rating: 5,
            City: 'Rasht',
            description: 'One of the most beautiful places that you can find in iran , a paradise you can never imagine',
        },
        {
            location: 'Gilan',
            rating: 5,
            City: 'Rasht',
            description: 'One of the most beautiful places that you can find in iran , a paradise you can never imagine',
        },
        {
            location: 'Gilan',
            rating: 5,
            City: 'Rasht',
            description: 'One of the most beautiful places that you can find in iran , a paradise you can never imagine',
        },
    ];

    const locationsTemplate = (locations: Informations) => {
        return (
            <div className={`CardsContainer flex flex-row w-full my-12 justify-center`}>
                <PlacesCard title={locations.location} description={locations.description} footerText='More' image={image} />
            </div>
        );
    };

    return (
        <div className='MostPopularSection w-full px-10 my-10'>
            <h1 className='text-3xl font-bold items-left'>
                Destinations Most Popular
            </h1>
            <div className='mt-6 card'>
                <Carousel
                    value={locations}
                    numVisible={2}
                    numScroll={2}
                    className="custom-carousel"
                    circular
                    autoplayInterval={3000}
                    itemTemplate={locationsTemplate}
                />
            </div>
        </div>
    );
};

export default MostPopularSection;