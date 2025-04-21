import React, { useEffect, useState } from 'react';

export const CountdownTimer = ({ targetID, targetDate, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const target = new Date(targetDate);

        if (isNaN(target)) {
            console.error(`Invalid date format`);
            return;
        }

        let timerInterval = null;
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = target - now;

            if (difference <= 0) {
                clearInterval(timerInterval);
                setTimeLeft("00:00:00"); // Timer reached zero
                if (onComplete) onComplete(targetID); // Notify parent that timer completed
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        };

        calculateTimeLeft();
        timerInterval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timerInterval); // Cleanup
    }, [targetDate, onComplete]);

    return (
        <div className='bg-yellow-500 px-1 py-[2px]'>
            <p className='text-center'>{timeLeft}</p>
        </div>
    );
};
