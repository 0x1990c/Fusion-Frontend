import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadingOff, loadingOn } from '../../store/authSlice'
import { Navbar } from '../common/Navbar'
import { Dropdown } from './Dropdown'
import { setMessages } from '../../store/messageSlice'
import { getMessages, sendSms, deleteMessage, addMessage, updateMessage } from '../../services/messages'
import { getClients, getCustomerCategories } from '../../services/clients'
import { getUser } from '../../services/auth';
import { checkout} from '../../services/stripe';
import { setClients } from '../../store/clientSlice'
import { setCategories } from '../../store/categorySlice'
import moment from 'moment'
import { DATE_FORMAT_CLIENT, DATE_TIME_FORMAT_CLIENT } from '../../constants'
import { CountdownTimer } from './CountDown'
import { IoMdRefresh } from 'react-icons/io'
import { AiTwotoneDelete } from "react-icons/ai";
import { MdOutlineEdit, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import toast from 'react-hot-toast'
import { FaRegCalendarDays } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
// import { WebSocketManager_Message } from '../../services/ws'
import { EditMessageModal } from './EditMessageModal';
import { SettingsModal } from '../Settings/SettingsModal'
import ConfirmDialog from '../common/ConfirmDialog'

export const MessagesTable = () => {
    const dispatch = useDispatch()
    const messages = useSelector(state => state.message.data)
    const clients = useSelector(state => state.client.data)
    const categories = useSelector(state => state.category.categories)
    const calendarRef = useRef(null);
    const timeRef = useRef(null);
    const [refetch, setRefetch] = useState(false)
    const messageRef = useRef(messages);
    const [message, setMessage] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [errors, setErrors] = useState({
        category: false,
        message: false,
        date: false,
        time: false
    });

    const [ws_message, setWs_message] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [purchaseBalanceMSG, setPurchaseBalanceMSG] = useState("Your SMS balance is low.");

    useEffect(() => {
        messageRef.current = messages;
    }, [messages])

    useEffect(() => {
        dispatch(loadingOn());
        fetchData();
        dispatch(loadingOff());
    }, [refetch])

    useEffect(() => {
        let websocketManager = null;

        const initializeWebSocket = () => {
            const API_MESSAGE = import.meta.env.VITE_WS_URL_MESSAGE;
            websocketManager = new WebSocket(API_MESSAGE);

            websocketManager.onopen = (event) => {
                websocketManager.send("Connect");
            };

            websocketManager.onmessage = (e) => {
                const message = JSON.parse(e.data);
                console.log("Message from server: ", message);

                if(message.type === "MESSAGE_UPDATE") {
                    const messageArr = messageRef.current.map((info) => {
                        const updatedItem = message.data.find((item) => item.id === info.id);
                        return updatedItem ? { ...info, num_sent: updatedItem.num_sent } : info;
                    });

                    if (messageArr) dispatch(setMessages(messageArr));
                }
            };

            websocketManager.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            setWs_message(websocketManager);
        };

        initializeWebSocket();

        // Cleanup function
        return () => {
            if (websocketManager && websocketManager.readyState === WebSocket.OPEN) {
                console.log("Closing WebSocket connection...");
                websocketManager.close();
            }
        };
    }, []);
    
    const fetchData = async () => {
        const clientsData = await getClients();
        const categoriesData = await getCustomerCategories();
        const messagesData = await getMessages();
        const user = await getUser();
        
        if(user){
            if(user.sms_balance < 10){
                setDialogOpen(true);
                const msg = "Your SMS balance is " + user.sms_balance + ". " + "Do you want to purchase SMS balance now?"
                setPurchaseBalanceMSG(msg);
            }
        }

        if (clientsData) dispatch(setClients(clientsData));
        if (categoriesData) dispatch(setCategories(categoriesData));
        if (messagesData) dispatch(setMessages(messagesData));
    };


    const handleClickCalendar = () => {
        calendarRef.current.showPicker();
    };

    const handleClickTime = () => {
        timeRef.current.showPicker();
    };

    const handleConfirm = async () => {
        
        dispatch(loadingOn());
        setDialogOpen(false);

        const user = await getUser();
        const data = {
            email: user.username,
            plan_id: "price_1R2c2IAZfjTlvHBosrQOiw6y"
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

            dispatch(loadingOff());
        } catch (error) {
            console.error("Error during checkout:", error);
            throw error;
        }
    };

    const handleDeleteMessage = async (id) => {
        dispatch(loadingOn());
        let res = await deleteMessage(id);

        if (res.detail === "Could not validate credentials") {
            alert('Unauthorized user!');
            navigate('/signup')
        }

        if (res.success) {
            toast.dismiss()
            toast.success("Successfully deleted the message!");
            setRefetch(!refetch);
        }
        dispatch(loadingOff());
    }

    const handleSendSms = async (messageId) => {
        // dispatch(loadingOn());

        const res = await sendSms(messageId);

        if (res.success) {
            toast.dismiss()
            toast.success("Successfully send the sms!");
            setRefetch(!refetch);
        }
    //    dispatch(loadingOff());
    }

    const handleMessageSubmit = async () => {
        const newErrors = {
            category: !selectedCategories || selectedCategories.length === 0,
            message: !message.trim(),
            date: !selectedDate,
            time: !selectedTime
        };
        
        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) {
            return;
        }

        try {
            const scheduledDateTime = `${selectedDate}T${selectedTime}`;    
            // Get unique phone numbers from selected categories
            const phoneNumbers = clients
                .filter(client => 
                    selectedCategories.some(categoryId => 
                        client.categories.includes(categoryId)
                    )
                )
                .flatMap(client => client.phone_numbers) // Use flatMap if phone_numbers is an array
                .filter((number, index, self) => self.indexOf(number) === index); // Remove duplicates
            
            const user_email = localStorage.getItem('user_email');

            const messageData = {
                last_message: message.trim(),
                qued_timestamp: scheduledDateTime,
                categories: selectedCategories,
                phone_numbers: phoneNumbers,
                user_email : user_email
            };

            const res = await addMessage(messageData);
            // console.log(res); return;

            if (res.message === "Raw data processed successfully") {
                toast.success("Message scheduled successfully!" + "\n" + "Now balance is " + res.balace);
                setMessage('');
                setSelectedDate('');
                setSelectedTime('');
                setSelectedCategories([]);
                setErrors({
                    category: false,
                    message: false,
                    date: false,
                    time: false
                });
                // Refresh the messages table
                setRefetch(!refetch);
            } else {
                toast.error(res.message + "\n" + "Now balance is " + res.balace);
            }
        } catch (error) {
            toast.error("Failed to schedule message");
            console.error(error);
        }
        //dispatch(loadingOff());
    };

    const handleEditClick = (message) => {
        setEditingMessage(message);
        setIsEditModalOpen(true);
    };

    const handleSubmit = (message) =>
    {

    }

    const handleEditSubmit = async (editedData) => {
        dispatch(loadingOn());
        try {
            const phoneNumbers = clients
            .filter(client => 
                selectedCategories.some(categoryId => 
                    client.categories.includes(categoryId)
                )
            )
            .flatMap(client => client.phone_numbers) // Use flatMap if phone_numbers is an array
            .filter((number, index, self) => self.indexOf(number) === index); // Remove duplicates
            // Remove duplicate phone numbers
           
            const messageData = 
            {
                last_message: editedData.last_message,
                qued_timestamp: editedData.qued_timestamp,
                categories: editedData.categories,
                phone_numbers: phoneNumbers
            };
            const res = await updateMessage(editedData.id, messageData);

            if (res.success) {
                toast.success("Message updated successfully!");
                // Update the messages in the store
                setIsEditModalOpen(false);
                setEditingMessage(null);
                setRefetch(!refetch);
            } else {
                toast.error(res.message || "Failed to update message");
            }
        } catch (error) {
            console.error('Error updating message:', error);
            toast.error("Failed to update message");
        }
        dispatch(loadingOff());
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = messages?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((messages?.length || 0) / itemsPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const sortItems = () => {
        return [...currentItems].sort((a, b) => {
            const dateA = new Date(a.qued_timestamp);
            console.log(dateA);
            const dateB = new Date(b.qued_timestamp);
            console.log(dateB);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    };

    // Handle sorting when header is clicked
    const handleSort = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const displayedItems = sortItems();

    const handleCountTimer = (targetID) => {
        console.log("isSent");
        console.log(targetID);
        handleSendSms(targetID)
    }

    return (
        <div>
            <ConfirmDialog
                isOpen={isDialogOpen} 
                message={purchaseBalanceMSG}
                onConfirm={handleConfirm} 
            />
            <Navbar />
            <div>
                <div id='message-form' className='flex items-center gap-5 bg-white px-5 mb-[2px] py-1'>
                    <div id='message-form-content' className='flex flex-1 items-center gap-4'>
                        <div className="flex-shrink-0">
                            <Dropdown 
                                id='dropdown-categories'
                                categories={categories}
                                onClick={(e) => {
                                    const status = selectedClients;
                                    if (status.length > 0) {
                                        setSelectedClients(status);
                                    }
                                }}
                                selectedValue={selectedCategories}
                                onCategorySelect={(newSelectedCategories) => {
                                setSelectedCategories(newSelectedCategories);
                                }}
                                onSelect={() => setErrors(prev => ({...prev, category: false}))}
                            />
                            {errors.category && <p className="text-red-500 text-sm mt-1">Please select a category</p>}
                        </div>

                        <div id='calendar-container' onClick={handleClickCalendar} className='cursor-pointer flex-shrink-0'>
                            <input
                                type="date"
                                ref={calendarRef}
                                className="absolute opacity-0 cursor-pointer"
                                onClick={(e) => {
                                    const status = calendarRef.current?.value;
                                    if (status) {
                                        setSelectedDate(status);
                                    }
                                }}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setErrors(prev => ({...prev, date: false}));
                                    console.log('Selected Date:', e.target.value);
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-3 ${errors.date ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {selectedDate || 'Calendar'}
                                </span>
                                <FaRegCalendarDays className={errors.date ? 'text-red-500' : 'text-red-700'} />
                            </div>
                            {errors.date && <p className="text-red-500 text-sm mt-1">Please select a date</p>}
                        </div>

                        <div id='time-container' onClick={handleClickTime} className='cursor-pointer flex-shrink-0'>
                            <input
                                type="time"
                                ref={timeRef}
                                className="absolute opacity-0 cursor-pointer"
                                onClick={(e) => {
                                    const status = timeRef.current?.value;
                                    if (status) {
                                        setSelectedTime(status);
                                    }
                                }}
                                onChange={(e) => {
                                    setSelectedTime(e.target.value);
                                    setErrors(prev => ({...prev, time: false}));
                                    console.log('Selected time:', e.target.value);
                                }}
                            />
                            <div className={`flex bg-gray-200 px-4 py-2 rounded-md cursor-pointer items-center gap-7 ${errors.time ? 'border border-red-500' : ''}`}>
                                <span className="font-medium cursor-pointer">
                                    {selectedTime || 'Time'}
                                </span>
                                <IoMdTime className={errors.time ? 'text-red-500' : 'text-red-700 text-lg'} />
                            </div>
                            {errors.time && <p className="text-red-500 text-sm mt-1">Please select a time</p>}
                        </div>

                        <div id='message-container' className='flex-1'>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    maxLength={150}
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        setErrors(prev => ({...prev, message: false}));
                                    }}
                                    onClick={(e) => {
                                        const status = message;
                                        if (status) {
                                            setMessage(status);
                                        }
                                    }}
                                    className={`w-full border ${errors.message ? 'border-red-500' : 'border-gray-300'} bg-gray-200 px-3 py-1.5 rounded-md placeholder:text-black placeholder:font-medium pr-16`}
                                    placeholder='Message...'
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    {message.length}/150
                                </span>
                            </div>
                            {errors.message && <p className="text-red-500 text-sm mt-1">Please enter a message</p>}
                        </div>
                    </div>

                    <div id='message-form-actions' className='flex-shrink-0 flex items-center gap-2'>
                        <button 
                            onClick={handleMessageSubmit}
                            className='bg-[#0088cc] hover:bg-[#006699] text-white px-6 py-2 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center gap-2'
                        >
                            <span>Submit</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200"
                        >
                            Settings
                        </button>
                    </div>
                </div>

                <table className="w-[100%]">
                    <thead className=" bg-red-700">
                        <tr>
                            <th className="w-[12.5%] pl-8 py-2 text-left text-lg text-white">Created On</th>
                            <th className="w-[18%] text-white text-lg text-left">Category</th>
                            <th className="w-[12%] text-white text-lg text-left cursor-pointer" onClick={handleSort}>Scheduled {sortOrder === 'asc' ? ' ↑' : ' ↓'}</th>
                            {/* (▲ / ▼)  */}
                            <th className="w-[40%] text-white text-lg text-left cursor-pointer">Message</th>
                            {/* <th className="w-[10%] text-white text-lg text-left">Image</th> */}
                            <th className="w-[5%] text-white text-lg text-left">Status</th>
                            <th className="text-white text-lg text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {displayedItems?.map((item, messageIndex) => {
                            let status = 'REVIEW';
                            //if (item.sent_timestamp) console.log("time:", item.sent_timestamp);
                            if (item.message_status === 1) {
                                status = 'REVIEW'
                            } else if (item.message_status === 2) {
                                status = 'QUED'
                            } else if (item.message_status === 3) {
                                status = 'SENT'
                            }

                            return (
                                <React.Fragment key={`parent-${messageIndex}`}>
                                    <tr className={`bg-red-700 border-t-2 border-t-white`}>
                                        <td className="text-lg pl-8 py-2 text-white">{moment.utc(item.created_at).format(DATE_FORMAT_CLIENT)}</td>
                                        <td className="text-lg  text-white text-left">{categories.filter(category => item.categories.includes(category.id)).map(category => category.name) .join(', ')}</td>
                                        <td className="text-lg  text-white text-left">{moment.utc(item.qued_timestamp).format(DATE_TIME_FORMAT_CLIENT)}</td>
                                        <td className="text-lg  text-white text-left">
                                            {item.last_message}
                                        </td>
                                        {/* <td className="text-lg font-semibold text-white text-left">
                                            <img src={item.image_url} alt={item.id} className='w-10 h-8 object-cover' />
                                        </td> */}
                                        <td className="text-lg font-semibold text-left">
                                            {
                                                new Date(item.qued_timestamp) > new Date() ? (
                                                    <CountdownTimer targetID={item.id} targetDate={item.qued_timestamp} onComplete={handleCountTimer}/>
                                                ) : (
                                                    <div className='bg-green-500 px-1 py-[2px]'>
                                                        <p className='text-center text-white'>{`${item.num_sent || 0}/${item.phone_numbers?.length}`}</p>
                                                    </div>
                                                )
                                            }
                                        </td>

                                        <td>
                                            <div id={`message-actions-${messageIndex}`} className='flex items-center justify-center gap-1'>
                                                {/* Only show refresh button if message is completed and past scheduled time */}
                                                {new Date(item.qued_timestamp) < new Date() && item.num_sent < item.phone_numbers?.length ? (
                                                    <IoMdRefresh 
                                                        className="text-3xl text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors" 
                                                        onClick={() => handleSendSms(item.id)}
                                                    />
                                                ) : (
                                                    <IoMdRefresh 
                                                        className="text-3xl text-white rounded-full p-1 transition-colors" 
                                                    />
                                                )}
                                                <MdOutlineEdit 
                                                    className="text-3xl text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors" 
                                                    onClick={() => handleEditClick(item)}
                                                />
                                                <AiTwotoneDelete 
                                                    className="text-2xl text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors"
                                                    onClick={() => handleDeleteMessage(item.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment >
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-4 gap-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                
                {/* {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`px-4 py-2 rounded ${
                            currentPage === number 
                                ? 'bg-white text-red-700' 
                                : 'bg-red-700 text-white'
                        }`}
                    >
                        {number}
                    </button>
                ))} */}
                
                <button
                    key={currentPage}
                    onClick={() => setCurrentPage(currentPage)}
                    className="px-4 py-2 bg-white text-red-700 rounded disabled:opacity-50">
                    {currentPage}
                </button>
                
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <div className="text-center mt-2 text-white">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, messages?.length || 0)} of {messages?.length || 0} entries
            </div>

            <EditMessageModal 
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingMessage(null);
                }}
                onSubmit={handleEditSubmit}
                message={editingMessage}
                categories={categories}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={handleSubmit}
                showOptinEdit={false}
            />
        </div>
    )
}
