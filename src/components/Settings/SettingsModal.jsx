import React, { useState, useEffect } from 'react';
import { checkout} from '../../services/stripe';
import { getUser } from '../../services/auth';
import { useSelector } from 'react-redux';
import { setBalance } from '../../store/balanceSlice';
import { useDispatch } from 'react-redux';

export const SettingsModal = ({
    isOpen,
    onClose,
    onSubmit,
    optinMessage,
    onSubscribe,
    showOptinEdit = false
}) => {
    const [editMessage, setEditMessage] = useState('');
    const [error, setError] = useState(false);
    const smsBalance = useSelector(state => state.balance.data);
    const dispatch = useDispatch()

    useEffect(() => {
        if (optinMessage) {
            setEditMessage(optinMessage);
        }
    }, [optinMessage]);

    useEffect(() => {
        const fetchBalance = async () => {
            const user = await getUser();
            // console.log("user: ", user)
            dispatch(setBalance(user.sms_balance));
        };
        fetchBalance();
    }, []);

    const handleSubmit = () => {
        if (!editMessage.trim()) {
            setError(true);
            return;
        }

        onSubmit({
            optin_message: editMessage.trim()
        });
    };

    const handleSubscription = async () => {

        const user = await getUser();
        
        const data = {
            email: user.username,
            plan_id: "price_1RCBOlAZfjTlvHBo7dhKtU1k"
        }
        try {
            const checkout_session_url = await checkout(data);
            
            if(checkout_session_url)
            {
                window.location.href = checkout_session_url;
            }

            else{
                console.error("No Url found in the response");
            }

        } catch (error) {
            console.error("Error during checkout:", error);
            throw error;
        }

    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[80%] max-w-4xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                
                <div className="flex flex-col gap-6">
                    {/* Edit Opt-in Section - Only show when showOptinEdit is true */}
                    {showOptinEdit && (
                        <div className="border-b pb-4">
                            <h3 className="text-xl font-semibold mb-4">Edit Opt-in Message</h3>
                            <div id='message-container' className='w-full'>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Opt-in Message
                                </label>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        maxLength={150}
                                        value={editMessage}
                                        onChange={(e) => {
                                            setEditMessage(e.target.value);
                                            setError(false);
                                        }}
                                        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} bg-gray-200 px-3 py-1.5 rounded-md placeholder:text-black placeholder:font-medium pr-16`}
                                        placeholder='Opt-in Message...'
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        {editMessage?.length}/150
                                    </span>
                                </div>
                                {error && <p className="text-red-500 text-sm mt-1">Please enter a message</p>}
                                
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
                    )}

                    {/* Subscription Section */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Subscription</h3>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-lg">Current SMS Balance: {smsBalance}</p>
                            <button
                                onClick={handleSubscription}
                                className={`px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors`}
                            >
                                Add 5000+ Balance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
