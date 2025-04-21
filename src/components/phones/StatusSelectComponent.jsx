import React, { useState, useRef, useEffect } from 'react';

const StatusSelectComponent = ({ initialOption, onSelectChange }) => {
    // Set the initial state based on the initialOption prop
    const [selectedOption, setSelectedOption] = useState('');

    useEffect(() => {
        setSelectedOption(initialOption);
    });

    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedOption(newValue);
        onSelectChange(newValue);
    };

    return (
        <div className="flex items-center w-full pt-4">
            <label htmlFor="mySelect" className="w-1/4">Status :</label>
            <select id="mySelect" value={selectedOption} onChange={handleChange} className={`w-1/4 border border-gray-300 bg-gray-200 px-3 py-1.5 rounded-md placeholder:text-black placeholder:font-medium pr-16`}>
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
                <option value="Success">Success</option>
                <option value="Refused">Refused</option>
            </select>
        </div>
    );
};

export default StatusSelectComponent;