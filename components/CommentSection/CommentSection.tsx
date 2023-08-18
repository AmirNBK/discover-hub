import React from 'react';
import CommentComponent from '../CommentComponent/CommentComponent';
import { Carousel } from 'primereact/carousel';

const CommentSection = () => {

    const comments = [
        {
            name: 'Jhone Lown',
            rating: 4,
            description: '“A very pleasant experience, plus the service is very friendly, recommended for those who want to try!”'
        },
        {
            name: 'Alice Johnson',
            rating: 5,
            description: '“Absolutely loved my experience here! The staff was amazing and the food was top-notch.”'
        },
        {
            name: 'Michael Smith',
            rating: 3,
            description: '“Decent place with good ambiance, although I expected better options on the menu.”'
        }
    ];

    const CommentsTemplate = (comments) => {
        return (
            <CommentComponent name={comments.name} rating={comments.rating} description={comments.description} />
        );
    };

    return (
        <div className='CommentSection py-16 flex flex-row justify-evenly'
        >
            <div className="card">
                <Carousel value={comments} numVisible={1} numScroll={1} className="custom-carousel" circular
                    autoplayInterval={3000} itemTemplate={CommentsTemplate} showIndicators={false} orientation="vertical" />
            </div>
            <div className='flex flex-col ml-12'>
                <h2 className='text-5xl w-8/12 font-bold leading-tight'>
                    Testimonials Travala Customers
                </h2>
                <h2 className='text-xl mt-12 w-8/12'
                    style={{ opacity: '0.6000000238418579', color: '#0C111F' }}>
                    What our customers have to say about our service, check it out!
                </h2>
            </div>
        </div>
    );
};

export default CommentSection;