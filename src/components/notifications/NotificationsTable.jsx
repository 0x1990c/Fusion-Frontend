import React, { useState, useEffect} from 'react'
import { TbPlus, TbMinus } from "react-icons/tb";
import { IoMdRefresh } from "react-icons/io";
import { FiDownload, FiMinusCircle, FiSearch  } from "react-icons/fi";
import { AiFillDelete, AiFillLike } from "react-icons/ai";
import { LuMessagesSquare, LuPencil } from "react-icons/lu";
import { IoCloseSharp } from "react-icons/io5";
import { BsCheckLg } from "react-icons/bs";
import { combineSlices } from '@reduxjs/toolkit';
import {getNotifications, setQued, cancelQued, setSent, updateLastMessage, downloadProjectMessage, downloadCustomerMessage, changeCustomerStatus, deleteCustomer, setVariables, getTimer, rerunChatGPT, getNewProjects, sendOptInEmail, sendOptInPhone, getVariables, checkMainTableUpdate, checkScrapingStatus, deleteProject, downloadHistoryMessage} from '../../services/notifications'
import ReactMarkdown from 'react-markdown';

import moment from 'moment';
import { DATE_FORMAT } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { setClient, setSendTimer, updateMessageStatus } from '../../store/notificationSlice';
import { loadingOff, loadingOn } from '../../store/authSlice';
import logo from "../../assets/logo.svg";
import messageIcon from "../../assets/message.svg";
import phoneIcon from "../../assets/phone.svg";
import {PhoneOptInIcon} from "../../assets/phone-icon.jsx";
import {EmailOptInIcon} from "../../assets/email-icon.jsx";
import { useNavigate } from 'react-router-dom';
import { EditMessageModal } from '../common/EditMessageModal';
import { SettingsModal } from '../common/SettingsModal'; // Import the SettingsModal component
import toast from "react-hot-toast";
import {BuildertrendScrapingStatus} from '../common/BuildertrendScrapingStatus.jsx';
import {XactanalysisScrapingStatus} from '../common/XactanalysisScrapingStatus.jsx';
import {RerunStatus} from '../common/RerunStatus.jsx';
import { Tooltip } from 'react-tooltip'


export const NotificationsTable = () => {
    const [expandId, setExpandId] = useState(null)
    const data = useSelector(state => state.notification.data)
    const sendTimer = useSelector(state => state.notification.sendTimer)
    const [editMessage, setEditMessage] = useState('')
    const [turnOnEdit, setTurnOnEdit] = useState(null)
    const [refetch, setRefetch] = useState(false)
    const [startBuildertrend, setStartBuildertrend] = useState(false)
    const [startXactanalysis, setStartXactanalysis] = useState(false)
    const [startRerun, setStartRerun] = useState(false)
    const dispatch = useDispatch()
    // State to manage the visibility and data of the settings modal
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsData, setSettingsData] = useState({
        openAIKey: '',
        twilioPhoneNumber: '',
        twilioAccountSID: '',
        twilioAuthToken: '',
        sendgridEmail: '',
        sendgridApiKey: '',
        prompts: '',
        timer: 0,
    });

    const [currentTab, setCurrentTab] = useState(0);
    const [remainTime, setRemainTime] = useState([]);
    const navigate = useNavigate()

    const [searchInput, setSearchInput] = useState("");
    const [filteredData, setFilteredData] = useState([]);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                      Handle Get Main Table Data

    useEffect(() => {
        fetchData();
        getVariables()
            .then(response => response.json())
            .then(result => {
                // console.log("result: ", result);
                console.log("settingsData: ", settingsData);
                setSettingsData(result);
            })
        
        // console.log(variables);
    }, [refetch, setSettingsData, currentTab])

// -----------------------------------------------------------------------------------------
    

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                          Handle Countdown Clock

    useEffect(() => {
        const interval = setInterval(async () => {
            console.log("send_Timer: ", sendTimer);
            const now = Date.now();
            const today = new Date();
            let sent_array = [];
            const timeArray = data?.map((item, itemIndex) => 
                item.data?.map((childData, childIndex) => {
                    
                    if(childData.message_status != 2) return "";

                    console.log(childData.qued_timestamp);
                    const timestamp = childData.qued_timestamp.endsWith('Z') ? 
                          childData.qued_timestamp :
                          `${childData.qued_timestamp}Z`;
                    const qued_time = new Date(timestamp);
                    console.log("qued_time", `${qued_time.getUTCHours()}:${qued_time.getUTCMinutes()}:${qued_time.getUTCSeconds()}`)
                    // console.log(qued_time.getTime());

                    qued_time.setUTCMinutes(qued_time.getUTCMinutes() + sendTimer); // Use UTC methods

                    // console.log("now", now)
                    console.log("now", `${today.getUTCHours()}:${today.getUTCMinutes()}:${today.getUTCSeconds()}`)
                    const difference = qued_time.getTime() - today.getTime();

                    console.log("difference: ", qued_time.getTime() < today.getTime());
                    
                    if(childData.message_status == 2 && qued_time.getTime() + 5< today.getTime()) {
                        sent_array.push([itemIndex, childIndex, childData.project_id]);
                    }
                    
                    const durationDate = new Date(difference);

                    // Format the duration as a UTC time string (ignoring the date part)
                    const timeString = durationDate.toISOString().substr(11, 8); // "HH:mm:ss" format

                    // Extract minutes and seconds
                    const minutes = timeString.substr(3, 2);
                    const seconds = timeString.substr(6, 2);

                    // Return the time difference as a string in the format "M:S"
                    return `${parseInt(minutes, 10)}:${seconds}`;
                })
            )

            setRemainTime(timeArray);

            sent_array.forEach(async (item) => {
                const itemIndex = item[0];
                const childIndex = item[1];
                const project_id = item[2];
                const newStatus = 3;
                // await setSent(project_id);
                // setRefetch(!refetch)
                dispatch(updateMessageStatus({ itemIndex, childIndex, newStatus }));
                await handlerSetSent(project_id);
            })

        }, 1000); // This will run every second
        
        // Clean up function
        return () => {
            clearInterval(interval);
        };
      
    }, [data, remainTime, updateMessageStatus, sendTimer, dispatch])

// -----------------------------------------------------------------------------------------


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                          Get All Table Data and Timer Value

    const fetchData = async () => {
        dispatch(loadingOn());
        let res = await getNotifications(currentTab);
        const timer = await getTimer();
        console.log("timer: ", timer);
        
        if (res.detail === "Could not validate credentials") {
            alert('Unauthorized user!');
            navigate('/signup')
        }
        
        if (res) {
            if (Array.isArray(res)) {
                console.log("rs: ", res);
                dispatch(setClient(res))
            }
        }
        dispatch(loadingOff())

        dispatch(setSendTimer(timer))
    }

// ----------------------------------------------------------------------------------------


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                      Real Time Check for Update of Main Table Data

    useEffect(() => {
        const interval = setInterval(() => {
            checkMainTableUpdate()
                .then(response => response.json())
                .then(result => {
                    if(result == true){
                        confirm("Table data updated! Shall you refresh the page?")
                        setRefetch(!refetch);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, 50000);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, [setRefetch, refetch]); // Empty array ensures the effect runs only once after the initial render

// ----------------------------------------------------------------------------------------

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                      Cancel Message Editing

    const handleCancelMessage = async () => {
        setEditMessage('');
        setTurnOnEdit(null)
    }

// ----------------------------------------------------------------------------------------



    useEffect(() => {
        setFilteredData(data);
    }, [data]);
    
    useEffect(() => {
        applySearchFilter();
    }, [searchInput, currentTab]);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const handlerDownloadProject = async (childStatus, childData) => {
        let project_id = childData.project_id;
        console.log(childStatus, childData.project_id_for_api)
        if(childStatus == "SENT") {
            await downloadHistoryMessage(childData.history_id);
        }
        else{
            await downloadProjectMessage(childData.project_id);
        }
    }
    const handlerDownloadCustomer = async (customer_id) => {
        await downloadCustomerMessage(customer_id)
    }
    const handlerSetQued = async (project_id, email, phone) => {
        let count = 0;
        if(email === ""){
            count += 1;
            toast.error("Can't find customer's email address.");
        }
        if(phone === ""){
            count += 1;
            toast.error("Can't find customer's phone number.");
        }

        if(count == 2){
            toast.error("Excuse me, you can't send message to this customer. There is no phone number or email address.");
            return;
        }

        dispatch(loadingOn())
        await setQued(project_id)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }
    const handlerCancelQued = async (project_id) => {
        dispatch(loadingOn())
        await cancelQued(project_id)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }
    const handlerSetSent = async (project_id) => {
        dispatch(loadingOn())
        await setSent(project_id)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }
    const handlerUpdateLastMessage = async (message) => {
        if (!turnOnEdit) return;
        // console.log("message: ", message);
        dispatch(loadingOn())
        await updateLastMessage(turnOnEdit, message)
        dispatch(loadingOff())
        setEditMessage('')
        setTurnOnEdit(null)
        setRefetch(!refetch)
    }
    const handlerChangeCustomerStatus = async (customer_id, method) => {
        // alert(method);
        dispatch(loadingOn())
        await changeCustomerStatus(customer_id, method)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }
    const handleDeleteCustomer = async (customer_id) => {
        dispatch(loadingOn())
        await deleteCustomer(customer_id)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }

    const handleDeleteMessage = async (projectId) => {
        dispatch(loadingOn())
        await deleteProject(projectId)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }

    // Function to open the settings modal
    const openSettingsModal = () => {
        setIsSettingsModalOpen(true);
    };

    // Function to close the settings modal
    const closeSettingsModal = () => {
        setIsSettingsModalOpen(false);
    };

    // Function to save settings data
    const saveSettings = async (newSettings) => {
        // Perform validation or API requests here to save the settings
        console.log('Settings saved:', newSettings);
        // Update the state with the new settings
        setSettingsData(newSettings);

        const res = await setVariables(newSettings);
        console.log("settings: ", res);
        // Close the modal
        closeSettingsModal();
        setRefetch(!refetch);
    };

    const savePrompts = async (newSettings) => {
        console.log('Settings saved:', newSettings); 
        setSettingsData(newSettings);
        dispatch(loadingOn());
        const res = await setVariables(newSettings);
        dispatch(loadingOff());
        if (typeof res === 'string') {
            toast.error(res);
            return;
        }
        if (res) {
            toast.success("Prompts updated successfully!");
            return
        }
    };

    const handleRerun = async() => {
        const response = await checkScrapingStatus();
        const result = await response.json();
        setStartRerun(true);
        rerunChatGPT();
        closeSettingsModal();
        if (result.project_total == result.project_current){
            setStartRerun(true);
            rerunChatGPT();
            closeSettingsModal();
            toast.success("Generating new messages started successfully!");
        }
        else{
            toast.success("Generating notifications started already!");
        }
    }

    const handleUpdateData = async (source) => {
        const response = await checkScrapingStatus();
        const result = await response.json();
        if(source == "BuilderTrend") {
            if (result.buildertrend_total != result.buildertrend_current) {
                console.log(result.buildertrend_total,  result.buildertrend_current);
                toast.success("Please wait until Buildertrend project updating finished.");
                return;
            }
            if (result.xactanalysis_total != result.xactanalysis_current){
                toast.success("Please wait until Xactanalysis project updating finished.");
                return;
            }
            setStartBuildertrend(true);
        }
        else {
            if (result.buildertrend_total != result.buildertrend_current) {
                console.log(result.buildertrend_total,  result.buildertrend_current);
                toast.success("Please wait until Buildertrend project updating finished.");
                return;
            }
            if (result.xactanalysis_total != result.xactanalysis_current){
                toast.success("Please wait until Xactanalysis project updating finished.");
                return;
            }
            setStartXactanalysis(true);
        }
        toast.success("Updating projects started successfully!");
        getNewProjects(source);
        closeSettingsModal();
    }

    const handleSendOptInEmail = async(customer_id, email) => {
        if(email === ""){
            toast.error("Can't find customer's email address.");
            return
        }
        dispatch(loadingOn());
        const res = await sendOptInEmail(customer_id, 1);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }
    const handleUpdateOptInEmailStatus = async(customer_id, opt_in_status, email) => {
        if(email === ""){
            toast.error("Can't find customer's email address.");
            return
        }
        dispatch(loadingOn());
        const res = await sendOptInEmail(customer_id, opt_in_status);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }
    const handleSendOptInPhone = async(customer_id, phone) => {
        if(phone === ""){
            toast.error("Can't find customer's phone number.");
            return
        }
        dispatch(loadingOn());
        const res = await sendOptInPhone(customer_id, 1);
        dispatch(loadingOff());
        toast.success("Opt In Text Sent Successfully!")
        setRefetch(!refetch);
    }
    const handleUpdateOptInPhoneStatus = async(customer_id, opt_in_status, phone) => {
        if(phone === ""){
            toast.error("Can't find customer's phone number.");
            return
        }
        dispatch(loadingOn());
        const res = await sendOptInPhone(customer_id, opt_in_status);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }

    const handleSetCurrentTab = (tabIndex) => {
        setCurrentTab(tabIndex);
    }

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const applySearchFilter = () => {
        if (searchInput.trim() === "") {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter((item) => {
            const itemData = `${item.first_name} ${item.last_name} ${item.project_name} ${item.claim_number}`.toLowerCase();
            return itemData.includes(searchInput.trim().toLowerCase());
        });
        setFilteredData(filtered);
    };

    const sortByLastName = () => {
        console.log("hhhhh");
        let sortedData = [...filteredData].sort((a, b) => a.last_name.localeCompare(b.last_name));
        setFilteredData(sortedData);
    }

    const sortByFirstName = () => {
        let sortedData = [...filteredData].sort((a, b) => a.first_name.localeCompare(b.first_name));
        setFilteredData(sortedData)
    }

    return (
        <div>
            <div className="w-[400px] pl-8 pt-8">
                <img src="Favicon.png" alt="logo" 
                    className="w-[100%] h-[100%]"
                />
            </div>

            <div className="pt-16" >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>

                    <div id="notification" className="py-2 px-4 bg-red-700 inline-block mb-[1px] cursor-pointer" onClick={() => handleSetCurrentTab(0)}>
                        <p className="text-xl font-semibold text-white">NOTIFICATIONS</p>
                    </div>
                    <div id="notification" className="py-2 px-4 bg-red-700 inline-block mb-[1px] mx-1 cursor-pointer" onClick={() => handleSetCurrentTab(1)}>
                        <p className="text-xl font-semibold text-white">DELETED</p>
                    </div>
                    <div className="relative flex items-center mr-auto ml-3">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            placeholder="Search..."
                            className="py-2 px-4 border rounded-md"
                        />
                        <FiSearch className="absolute right-2 text-xl text-gray-600" />
                    </div>
                        
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <BuildertrendScrapingStatus 
                            startBuildertrend={startBuildertrend}
                            setStartBuildertrend={setStartBuildertrend}
                            startRun={startRerun}
                            setStartRerun={setStartRerun}
                        />
                        <XactanalysisScrapingStatus 
                            startXactanalysis={startXactanalysis}
                            setStartXactanalysis={setStartXactanalysis}
                            startRun={startRerun}
                            setStartRerun={setStartRerun}
                            mode={"web"}
                        />
                        <RerunStatus
                            startRerun={startRerun}
                            setStartRerun={setStartRerun}

                        />
                        <div className="py-2 px-6 bg-green-700 inline-block mb-[1px] cursor-pointer" onClick={openSettingsModal}>
                            <p className="text-xl font-semibold text-white">SETTINGS</p>
                        </div>
                    </div>
                </div>
                <div>
                    <table className="w-[100%]">
                        <thead className=" bg-red-700">
                            <tr>
                                <th className="w-[5%]"/>
                                <th className="w-[9%] text-center p-2 text-lg text-white">Send On</th>
                                <th className="w-[9%] text-white text-lg text-center cursor-pointer" onClick={sortByLastName}>Last Name</th>
                                <th className="w-[9%] text-white text-lg text-center cursor-pointer" onClick={sortByFirstName}>First Name</th>
                                <th className="w-[18%] text-white text-lg text-center">Claim</th>
                                <th className="w-[12%] text-white text-lg text-center">Status</th>
                                <th className="w-[38%] text-white text-lg text-center">Message</th>
                            </tr>
                        </thead>
                        
                        <tbody className="bg-white">
                            
                            {filteredData?.map((item, dataIndex) => {
                                let status = 'REVIEW';
                                if (item.sent_timestamp) console.log("time:", item.sent_timestamp);
                                if (item.message_status === 1) {
                                    status = 'REVIEW'
                                }else if (item.message_status === 2) {
                                    status = 'QUED'
                                }else if (item.message_status === 3) {
                                    status = 'SENT'
                                }

                                return (
                                    <React.Fragment key={`parent-${item.project_id}`}>
                                        <tr className={`${expandId === item.customer_id ? "bg-red-700": "bg-gray-400"} border-t-2 border-t-white `}>
                                            <td className="text-center p-2">
                                                {expandId === item.customer_id ? <TbMinus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandId(null)}/> : 
                                                    <TbPlus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandId(item.customer_id)}/> }
                                            </td>
                                            <td className="text-lg font-semibold text-white text-center">{!(expandId === item.customer_id) && (item.sent_timestamp ? moment.utc(item.sent_timestamp).format(DATE_FORMAT) : '-')}</td>
                                            <td className="text-lg font-semibold text-white text-center">{!(expandId === item.customer_id)  && item.last_name}</td>
                                            <td className="text-lg font-semibold text-white text-center">{!(expandId === item.customer_id)  && item.first_name}</td>
                                            <td className="text-lg font-semibold text-white text-center">
                                                {
                                                    !(expandId === item.customer_id)  && (
                                                        <>
                                                            {item.project_name}
                                                            <br />
                                                            {item.claim_number}
                                                        </>
                                                    )
                                                }
                                            </td>
                                            <td className="text-lg font-semibold text-white text-center flex px-6">
                                                {
                                                    <>
                                                        <div
                                                            className="flex w-[80%] mx-auto text-center py-1 text-white"
                                                            style={{ borderRadius: '0.5rem', cursor: 'pointer', display: "flex", justifyContent: "center"}}
                                                            data-tooltip-id={`tooltip-email-${item.customer_id}`}
                                                            data-tooltip-html={`
                                                                <div>
                                                                    <span  style="font-weight: bold">Email: </span>
                                                                    ${item.email ? item.email : "email not found"}
                                                                </div>
                                                            `}
                                                            data-tooltip-delay-show={500}
                                                        >
                                                            
                                                            {
                                                                (!item.opt_in_status_email) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onClick={() => handleSendOptInEmail(item.customer_id, item.email)}> 
                                                                        <EmailOptInIcon />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_email === 1) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onDoubleClick={() => handleSendOptInEmail(item.customer_id, item.email)}> 
                                                                        <EmailOptInIcon fill='#fbf50a'/>
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_email === 2) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}}> 
                                                                        <EmailOptInIcon fill='mediumspringgreen' />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_email === 3) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onClick={() => handleUpdateOptInEmailStatus(item.customer_id, 4, item.email)}> 
                                                                        <EmailOptInIcon fill='orangered' />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_email === 4) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}}> 
                                                                        <EmailOptInIcon fill='orange' />
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        <Tooltip id={`tooltip-email-${item.customer_id}`} place="bottom" />
                                                        <div
                                                            className="w-[80%] mx-auto text-center py-1 text-white"
                                                            style={{ borderRadius: '0.5rem', cursor: 'pointer', display: "flex", justifyContent: "center"}}
                                                            data-tooltip-id={`tooltip-phone-${item.customer_id}`}
                                                            data-tooltip-html={`
                                                                <div>
                                                                    <span  style="font-weight: bold">Phone: </span>
                                                                    ${item.phone ? item.phone: "phone not found"}
                                                                </div>
                                                            `}
                                                            data-tooltip-delay-show={500}
                                                        >
                                                            {
                                                                (!item.opt_in_status_phone) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onClick={() => handleSendOptInPhone(item.customer_id, item.phone)}>
                                                                        <PhoneOptInIcon />
                                                                        
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_phone === 1) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onDoubleClick={() => handleSendOptInPhone(item.customer_id, item.phone)}>
                                                                        <PhoneOptInIcon fill='#fbf50a'/>
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_phone === 2) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}}>
                                                                        <PhoneOptInIcon fill='mediumspringgreen' />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_phone === 3) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}} onClick={() => handleUpdateOptInPhoneStatus(item.customer_id, 4, item.phone)}>
                                                                        <PhoneOptInIcon fill='orangered' />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                (item.opt_in_status_phone === 4) && (
                                                                    <div className='mx-auto' style={{width:"50px", height: "37px"}}>
                                                                        <PhoneOptInIcon fill='orange' />
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        <Tooltip id={`tooltip-phone-${item.customer_id}`} place="bottom" />
                                                    </>
                                                }
                                                
                                            </td>


                                            <td>
                                                <div className='flex items-center justify-between'>
                                                    <div>
                                                        <p className="text-lg font-semibold text-white">{}</p>
                                                    </div>
                                                    <div className="flex justify-end mr-3 gap-3 items-center">
                                                        <div className="flex" style={{gap:"0"}}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{backgroundColor:"#fbf50a" }}>
                                                                <span className="text-black text-sm">{item.qued}</span>
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{backgroundColor:"orange" , marginLeft:'-9px'}}>
                                                                <span className="text-white text-sm">{item.review}</span>
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{backgroundColor:"mediumspringgreen" , marginLeft:'-9px'}}>
                                                                <span className="text-white text-sm">{item.sent}</span>
                                                            </div>
                                                        </div>
                                                        <LuMessagesSquare className="text-3xl text-white" />
                                                        {/* <IoMdRefresh className={`text-3xl ${expandId === item.project_id? 'text-green-500': 'text-white'}`} /> */}
                                                        {item.sending_method == 2 ? (<IoMdRefresh className="text-3xl text-green-500 cursor-pointer" onClick={() => handlerChangeCustomerStatus(item.customer_id, 1)}/>) : (
                                                            <IoMdRefresh className="text-3xl text-white cursor-pointer" onClick={() => handlerChangeCustomerStatus(item.customer_id, 2)}/>)}
                                                        <FiDownload className="text-3xl text-white"  onClick={() => handlerDownloadCustomer(item.customer_id)}/>
                                                        <IoCloseSharp className="text-3xl text-white cursor-pointer"  onClick={() => {
                                                            handleDeleteCustomer(item.customer_id)
                                                        }}/>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandId === item.customer_id  && item.data?.map((childData, childIndex) => {
                                            let childStatus = 'REVIEW';
                                            if (childData.message_status === 1) {
                                                childStatus = 'REVIEW'
                                            }else if (childData.message_status === 2) {
                                                childStatus = 'QUED'
                                            }else if (childData.message_status === 3) {
                                                childStatus = 'SENT'
                                            }

                                            return (
                                                <tr key={`child - ${childData.project_id}`} className={`bg-white border-t-2 border-t-gray-300 text-center`}>
                                                    <td />
                                                    <td className="text-lg font-semibold py-2">{childData.sent_timestamp ? moment.utc(childData.sent_timestamp).format(DATE_FORMAT) : '-'}</td>
                                                    <td className="text-lg font-semibold">{childData.last_name}</td>
                                                    <td className="text-lg font-semibold">{childData.first_name}</td>
                                                    <td className="text-lg font-semibold">
                                                        {
                                                            <>
                                                                {childData.project_name}
                                                                <br />
                                                                {childData.claim_number}
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="text-lg font-semibold">
                                                        <div className={`w-[80%] mx-auto text-orange-900 text-center py-1
                                                            ${childStatus === 'REVIEW' ? 'bg-yellow-500' : childStatus === 'QUED' ? 'bg-yellow-300' : 'bg-green-300'}`}>
                                                            {childStatus} 
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex justify-between mr-3 gap-3 items-center">
                                                        
                                                            <p className="text-lg font-semibold text-orange-900">{childData.last_message ? childData.last_message.slice(0, 50) + '...' : ''}</p>
                                                            
                                                            <div className="flex gap-3 items-center">
                                                                <p>{(childStatus === "QUED" && remainTime[dataIndex][childIndex]) && remainTime[dataIndex][childIndex]}</p> 
                                                                <LuPencil className="text-2xl text-gray-400 cursor-pointer" 
                                                                onClick={() => {
                                                                    setTurnOnEdit(childData.project_id)
                                                                    setEditMessage(childData.last_message || '')
                                                                }}
                                                                /> 
                                                                { childStatus === 'REVIEW' && 
                                                                    (
                                                                        (item.opt_in_status_email ==3 && item.opt_in_status_phone ==3) ? 
                                                                        <BsCheckLg className="text-3xl text-red-400 cursor-pointer" /> :
                                                                        <BsCheckLg className="text-3xl text-gray-400 cursor-pointer" 
                                                                            onClick={() => handlerSetQued(childData.project_id, childData.email, childData.phone)}
                                                                        />
                                                                        
                                                                    )
                                                                }
                                                                { childStatus === 'QUED' && (
                                                                    <div className='flex cursor-pointer'>
                                                                        <BsCheckLg className="text-3xl text-gray-400 cursor-pointer" />
                                                                        <BsCheckLg className="text-3xl text-gray-500 cursor-pointer -ml-4" />
                                                                    </div>
                                                                )}
                                                                { childStatus === 'SENT' && (
                                                                    <div className='flex cursor-pointer'>
                                                                        {
                                                                            
                                                                            (childData.email !== "") && (<>
                                                                                <img src={messageIcon} alt="messageIcon" style={{width:"30px", height: "30px", marginRight: "-30px"}}/>
                                                                                <BsCheckLg className={`text-3xl ${childData.email_sent_success == 1 ? 'text-green-500' : 'text-red-500'} cursor-pointer`} />
                                                                                <BsCheckLg className={`text-3xl ${childData.email_sent_success == 1 ? 'text-green-500' : 'text-red-500'} cursor-pointer -ml-4`} />
                                                                            </>)
                                                                        }
                                                                        
                                                                        {
                                                                            (childData.phone !== "") && (<>
                                                                                <img src={phoneIcon} alt="phoneIcon" style={{width:"30px", height: "30px", marginRight: "-30px"}}/>
                                                                                <BsCheckLg className={`text-3xl ${childData.phone_sent_success == 1 ? 'text-green-500' : 'text-red-500'} cursor-pointer -ml-1`} />
                                                                                <BsCheckLg className={`text-3xl ${childData.phone_sent_success == 1 ? 'text-green-500' : 'text-red-500'} cursor-pointer -ml-4 -mr-2`} />
                                                                            </>)
                                                                        }
                                                                    </div>
                                                                )}
                                                                {/* { childStatus === 'SENT' && (
                                                                    <div className='flex cursor-pointer'>
                                                                        <img src={phoneIcon} alt="logo" style={{width:"30px", height: "30px", marginRight: "-30px"}}
                                                                        />
                                                                        <BsCheckLg className="text-3xl text-green-500 cursor-pointer" />
                                                                        <BsCheckLg className="text-3xl text-green-500 cursor-pointer -ml-4" />
                                                                        
                                                                    </div>
                                                                )} */}
                                                                { childStatus === 'QUED' && <FiMinusCircle className='text-2xl cursor-pointer text-red-500' 
                                                                    onClick={() => handlerCancelQued(childData.project_id) }
                                                                />}
                                                                <FiDownload className="text-3xl cursor-pointer " onClick={() => handlerDownloadProject(childStatus, childData)}/>

                                                                { childStatus === 'REVIEW' && <AiFillDelete className="text-3xl text-red-500 cursor-pointer"
                                                                    onClick={() => {
                                                                        const res = confirm('Are you really sure to delete the message?')
                                                                        if (res) {
                                                                            handleDeleteMessage(childData.project_id)
                                                                        }
                                                                    }}
                                                                /> }
                                                                {/* { childStatus === 'SENT' && <AiFillLike className="text-2xl cursor-pointer"/> } */}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </React.Fragment >
                                )
                            })}
                        </tbody>
                    </table>
                    { turnOnEdit && <EditMessageModal message={editMessage} onSave={handlerUpdateLastMessage} onCancel={handleCancelMessage} /> }
                    
                    {/* Settings Modal */}
                    <SettingsModal
                        isOpen={isSettingsModalOpen}
                        onSave={saveSettings}
                        onSavePrompts={savePrompts}
                        onCancel={closeSettingsModal}
                        settings={settingsData}
                        onRerun={handleRerun}
                        onUpdateData={handleUpdateData}
                    />
                </div>
            </div>
        </div>
    )
}
