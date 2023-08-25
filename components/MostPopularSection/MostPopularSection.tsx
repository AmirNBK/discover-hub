import React, { useEffect, useState } from 'react';
import { Carousel } from 'primereact/carousel';
import PlacesCard from '../CommonComponents/PlacesCard/PlacesCard';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import image from '../../assets/images/image1.png'
import { createClient } from 'pexels';

const MostPopularSection = (props: {
    data: any
}) => {
    const [pics, setPics] = useState<any>()
    const query = 'locations';
    const client = createClient('XZYowhK5D5FH0PTSgEWfcbWGtK2v1gLVuROLcUowriW39LIhI1jV3qa2');
    const data = props.data
    
    interface Informations {
        name: string;
        rating: number;
        City: string;
        description: string;
    }

    const responsiveOptions = [
        {
            breakpoint: '1300px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '1000px',
            numVisible: 1,
            numScroll: 1
        }
    ];


    const locationsTemplate = (locations: Informations) => {
        return (
            <div className={`CardsContainer flex flex-row w-full my-12 justify-center`}>
                <PlacesCard title={locations.name} footerText='More' image={image}
                    state={locations?.location.locality || locations?.location.region} category={locations.categories[0].name}
                    address={locations.location.formatted_address}
                />
            </div>
        );
    };

    return (
        <div className='MostPopularSection w-full px-10 my-10'>
            <h1 className='text-3xl font-bold items-left md:text-left text-center'>
                Destinations Most Popular
            </h1>
            <div className="card">
                <Carousel value={data} numVisible={3} numScroll={3} className="custom-carousel" circular
                    itemTemplate={locationsTemplate} showIndicators={false}
                    responsiveOptions={responsiveOptions} />
            </div>
        </div>
    );
};

export default MostPopularSection;