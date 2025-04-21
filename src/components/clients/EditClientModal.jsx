import React, { useState, useRef, useEffect } from 'react';
import { FaRegCalendarDays } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";

export const EditClientModal = ({
        isOpen,
        onClose,
    }) => {

    const handleSubmit = () => {
        
    };
    
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[80%] max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Edit Client</h2>
                
                
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