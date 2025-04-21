import React, { useState, useRef, useEffect } from 'react';
import { FaRegCalendarDays } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { Dropdown } from './DropDown'
import StatusSelectComponent from './StatusSelectComponent'

export const EditPhoneModal = ({
        isOpen,
        onClose,
        onSubmit,
        client
    }) => {

    const [phoneId, setPhoneId] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerId, setCustomerId] = useState(0);
    const [optionStatus, setOptionStatus] = useState('');
    const [sentDate, setSentDate] = useState('');
    const [sentTime, setSentTime] = useState('');
    const [backDate, setBackDate] = useState('');
    const [backTime, setBackTime] = useState('');
    
    const [errors, setErrors] = useState({
        status: false,
        phoneNumber: false,
        customerId: false,
        sentDate: false,
        sentTime: false,
        backDate: false,
        backTime: false,
    });

    const calendarRef = useRef(null);
    const timeRef = useRef(null);

    useEffect(() => {
        if (client) {
            setPhoneId(client.id);
            setPhoneNumber(client.phone_number);
            setCustomerId(client.customer_id);
            setOptionStatus(client.optin_status);

            const sentDateTime = new Date(client.sent_timestamp);
            setSentDate(sentDateTime.toISOString().split('T')[0]);
            setSentTime(sentDateTime.toTimeString().slice(0, 5));

            const backDateTime = new Date(client.back_timestamp);
            setBackDate(backDateTime.toISOString().split('T')[0]);
            setBackTime(backDateTime.toTimeString().slice(0, 5));

        }
    }, [client]);

    const handleSubmit = () => {
        
        const newErrors = {
            phoneNumber: !phoneNumber.trim(),
            customerId: !customerId,
            sentDate: !sentDate,
            sentTime: !sentTime,
            backDate: !backDate,
            backTime: !backTime,
        };
        
        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) {
            return;
        }

        const sentDateTime = `${sentDate}T${sentTime}`;
        const backDateTime = `${backDate}T${backTime}`;

        onSubmit({
            phoneId: phoneId,
            phoneNumber: phoneNumber.trim(),
            customerId: customerId,
            optionStatus : optionStatus,
            sentDateTime : sentDateTime,
            backDateTime : backDateTime
        });
    };
    
    const handleSentClickCalendar = () => {
        calendarRef.current.click();
    };

    const handleSentClickTime = () => {
        timeRef.current.click();
    };

    const handleBackClickCalendar = () => {
        calendarRef.current.click();
    };

    const handleBackClickTime = () => {
        timeRef.current.click();
    };

    const handleStatusChange = (newStatus) => {
        setOptionStatus(newStatus);
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;

        // Regular expression to allow only numbers and the "+" symbol
        const regex = /^[0-9+]*$/;

        if (regex.test(value)) {
            setPhoneNumber(value);
            setErrors(prev => ({ ...prev, phoneNumber: false }));
        } else {
            setErrors(prev => ({ ...prev, phoneNumber: true })); // Set error if invalid input
        }
    };

    const handleCustomerIDChange = (e) => {
        const value = e.target.value;

        // Regular expression to allow only numbers and the "+" symbol
        const regex = /^[0-9]*$/;

        if (regex.test(value)) {
            setCustomerId(value);
            setErrors(prev => ({ ...prev, customerId: false }));
        } else {
            setErrors(prev => ({ ...prev, customerId: true })); // Set error if invalid input
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[80%] max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Edit Phone</h2>
                
                <div className="flex-shrink-0">
                    <StatusSelectComponent initialOption={optionStatus} onSelectChange={handleStatusChange}/>
                </div>

                <div className="flex flex-col items-center gap-4 pt-6">
                    <div className="flex w-full">
                        <p className="mb-4 w-1/4">Phone Number : </p>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            className={`w-full border border-gray-300 bg-gray-200 px-3 py-1.5 rounded-md placeholder:text-black placeholder:font-medium pr-16`}
                            placeholder='phone number'
                        />
                    </div>
                    
                    <div className="flex w-full">
                        <p className="mb-4 w-1/4">Customer ID : </p>
                        <input
                            type="text"
                            value={customerId}
                            onChange={handleCustomerIDChange}
                            className={`w-full border border-gray-300 bg-gray-200 px-3 py-1.5 rounded-md placeholder:text-black placeholder:font-medium pr-16`}
                            placeholder='customer id'
                        />
                    </div>

                    <div className="flex w-full">
                        <p className="mb-4 w-1/4">Sent Timestamp : </p>

                        <div id='calendar-container' onClick={handleSentClickCalendar} className='cursor-pointer flex-shrink-0'>
                            <input
                                type="date"
                                ref={calendarRef}
                                className="absolute opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    setSentDate(e.target.value);
                                    setErrors(prev => ({...prev, sentDate: false}));
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-3 ${errors.sentDate ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {sentDate || 'Calendar'}
                                </span>
                                <FaRegCalendarDays className={errors.sentDate ? 'text-red-500' : 'text-red-700'} />
                            </div>
                            {errors.sentDate && <p className="text-red-500 text-sm mt-1">Please select a date</p>}
                        </div>

                        <div id='time-container' onClick={handleSentClickTime} className='cursor-pointer flex-shrink-0 ml-4'>
                            <input
                                type="time"
                                ref={timeRef}
                                className="absolute opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    setSentTime(e.target.value);
                                    setErrors(prev => ({...prev, sentTime: false}));
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-7 ${errors.sentTime ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {sentTime || 'Time'}
                                </span>
                                <IoMdTime className={errors.sentTime ? 'text-red-500' : 'text-red-700 text-lg'} />
                            </div>
                            {errors.sentTime && <p className="text-red-500 text-sm mt-1">Please select a time</p>}
                        </div>
                    </div>

                    <div className="flex w-full">
                        <p className="mb-4 w-1/4">Back Timestamp : </p>
                        
                        <div id='calendar-container' onClick={handleBackClickCalendar} className='cursor-pointer flex-shrink-0'>
                            <input
                                type="date"
                                ref={calendarRef}
                                className="absolute opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    setBackDate(e.target.value);
                                    setErrors(prev => ({...prev, backDate: false}));
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-3 ${errors.backDate ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {backDate || 'Calendar'}
                                </span>
                                <FaRegCalendarDays className={errors.backDate ? 'text-red-500' : 'text-red-700'} />
                            </div>
                            {errors.backDate && <p className="text-red-500 text-sm mt-1">Please select a date</p>}
                        </div>

                        <div id='time-container' onClick={handleBackClickTime} className='cursor-pointer flex-shrink-0 ml-4'>
                            <input
                                type="time"
                                ref={timeRef}
                                className="absolute opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    setBackTime(e.target.value);
                                    setErrors(prev => ({...prev, backTime: false}));
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-7 ${errors.backTime ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {backTime || 'Time'}
                                </span>
                                <IoMdTime className={errors.backTime ? 'text-red-500' : 'text-red-700 text-lg'} />
                            </div>
                            {errors.backTime && <p className="text-red-500 text-sm mt-1">Please select a time</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}; 