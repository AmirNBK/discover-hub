import Image from 'next/image';
import React from 'react';

const FeatureContainer = (props: {
    title: string, description: string, icon: any, bgColor: string
}) => {
    const title = props.title
    const description = props.description
    const icon = props.icon
    const bgColor = props.bgColor
    return (
        <div className='FeatureContainer'>
            <div style={{ background: bgColor }}>
                <Image src={icon} alt={icon} />
            </div>
            <div>
                <h3> {title} </h3>
                <p> {description} </p>
            </div>
        </div>
    );
};

export default FeatureContainer;