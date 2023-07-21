import React from 'react';
import user from '../../assets/icons/user.svg'
import Image from 'next/image';
import { Rating } from 'primereact/rating';

const CommentComponent = (props: {
    name: string,
    rating: number,
    description: string
}) => {
    const name = props.name
    const rating = props.rating
    const description = props.description

    return (
        <div className='bg-white p-6 flex flex-col gap-3'
            style={{ borderRadius: '20px', backdropFilter: 'blur(5.5px)', width: '558px', height: '238px' , boxShadow : '0px 1px 4px 0px rgba(0,0,0,0.1)' }}
        >
            <Image src={user} alt='user' />
            <h3 className='font-bold text-xl'> {name} </h3>
            <Rating value={rating} cancel={false} />
            <p className='text-sm' style={{ opacity: '0.6000000238418579' }}>
                {description}
            </p>
        </div>
    );
};

export default CommentComponent;