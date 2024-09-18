import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

const Counter = ({ end, duration }) => {
    const numberRef = useRef(null);

    useEffect(() => {
        anime({
            targets: numberRef.current,
            innerHTML: [0, end],
            round: 1,
            duration: duration * 1000,
            easing: 'linear'
        });
    }, [end, duration]);

    return <div ref={numberRef}>0</div>;
};

export default Counter;
