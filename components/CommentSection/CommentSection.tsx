import React from 'react';
import CommentComponent from '../CommentComponent/CommentComponent';

const CommentSection = () => {
    return (
        <div className='CommentSection py-16 flex flex-row justify-evenly'
        >
            <CommentComponent name='Jhone Lown' rating={4} description='“A very pleasant experience, plus the service is very friendly, recommended for those who want to try!”' />
            <div className='flex flex-col ml-12'>
                <h2 className='text-5xl w-8/12 font-bold leading-tight'>
                    Testimonials Travala Customers
                </h2>
                <h2 className='text-xl mt-12 w-8/12'
                    style={{ opacity: '0.6000000238418579', color: '#0C111F'}}>
                    What our customers have to say about our service, check below!
                </h2>
            </div>
        </div>
    );
};

export default CommentSection;