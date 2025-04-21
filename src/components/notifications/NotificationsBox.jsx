import React, { useEffect, useState } from 'react'
import { TbPlus, TbMinus } from "react-icons/tb";
import { IoMdRefresh } from "react-icons/io";
import { FiDownload, FiMinusCircle } from "react-icons/fi";
import { AiFillDelete, AiFillLike } from "react-icons/ai";
import { LuPencil } from "react-icons/lu";
import { IoCloseSharp } from "react-icons/io5";
import { BsCheckLg } from "react-icons/bs";

import { useDispatch, useSelector } from 'react-redux';
import { setClient, setSendTimer, updateMessageStatus } from '../../store/notificationSlice';
import { loadingOff, loadingOn } from '../../store/authSlice';
import { cancelQued, changeCustomerStatus, deleteCustomer, getNotifications, setQued, setSent, updateLastMessage, getTimer, getNewProjects, setVariables, rerunChatGPT, sendOptInEmail, sendOptInPhone, getVariables, checkScrapingStatus, checkMainTableUpdate, deleteProject } from '../../services/notifications';
import moment from 'moment';
import { DATE_FORMAT } from '../../constants';
import { EditMessageModal } from '../common/EditMessageModal';
import toast from 'react-hot-toast';
import messageIcon from "../../assets/message.svg";
import settingsIcon from "../../assets/settings.svg";
import phoneIcon from "../../assets/phone.svg"
import logo from "../../assets/logo.svg";
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from '../common/SettingsModal'; // Import the SettingsModal component
import {BuildertrendScrapingStatus} from '../common/BuildertrendScrapingStatus.jsx';
import {XactanalysisScrapingStatus} from '../common/XactanalysisScrapingStatus.jsx';

import { Tooltip } from 'react-tooltip'
import { RerunStatus } from '../common/RerunStatus.jsx';

export const NotificationsBox = () => {
    const [expandId, setExpandId] = useState(null)
    const [expandChildId, setExpandChildId] = useState(null)
    const data = useSelector(state => state.notification.data)
    const sendTimer = useSelector(state => state.notification.sendTimer)

    const [editMessage, setEditMessage] = useState('')
    const [turnOnEdit, setTurnOnEdit] = useState(null)
    const [refetch, setRefetch] = useState(false);
    const dispatch = useDispatch()
    const [remainTime, setRemainTime] = useState([]);
    const navigate = useNavigate()


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

    const [startBuildertrend, setStartBuildertrend] = useState(false)
    const [startXactanalysis, setStartXactanalysis] = useState(false)
    const [startRerun, setStartRerun] = useState(false)

    const fetchData = async () => {
        dispatch(loadingOn())
        const res = await getNotifications();
        const timer = await getTimer();
        dispatch(loadingOff())

        if (res.detail === "Could not validate credentials") {
            alert('Unauthorized user!');
            navigate('/signup')
        }
        
        if (res) {
            if (Array.isArray(res)) {
                dispatch(setClient(res))
            }
        }

        dispatch(setSendTimer(timer))
    }


    const handlerSetSent = async (project_id) => {
        dispatch(loadingOn())
        await setSent(project_id)
        dispatch(loadingOff())
        setRefetch(!refetch)
    }
    
    useEffect(() => {
        fetchData()
        getVariables()
            .then(response => response.json())
            .then(result => {
                // console.log("result: ", result);
                console.log("settingsData: ", settingsData);
                setSettingsData(result);
            })
        
    }, [refetch, setSettingsData])

    useEffect(() => {
        const interval = setInterval(async () => {
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
                    
                    if(childData.message_status == 2 && qued_time.getTime() < today.getTime()) {
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
      
    }, [data, remainTime, updateMessageStatus, dispatch, sendTimer, handlerSetSent])


    

    const handleCancelMessage = async () => {
        setEditMessage('');
        setTurnOnEdit(null)
    }

    const handlerUpdateLastMessage = async (message) => {
        if (!turnOnEdit) return;
        
        dispatch(loadingOn())
        await updateLastMessage(turnOnEdit, message)
        dispatch(loadingOff())
        setEditMessage('')
        setTurnOnEdit(null)
        setRefetch(!refetch)
    }

    const handleDeleteMessage = async (projectId) => {
        dispatch(loadingOn())
        await deleteProject(projectId)
        dispatch(loadingOff())
        setRefetch(!refetch)
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

    const handlerChangeCustomerStatus = async (customer_id, method) => {
        // toast(method);
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

    const handleRerun = async () => {
        toast.success("Message updating started successfully!");
        setStartRerun(true);
        rerunChatGPT();
        closeSettingsModal();
        toast.success("Generating new messages started successfully!");
        
    }

    const handleUpdateData = async (source) => {
        const response = await checkScrapingStatus();
        const result = await response.json();
        console.log("result: ", result)
        if(source == "BuilderTrend") {
            if (result.buildertrend_total != result.buildertrend_current) {
                console.log(result.buildertrend_total,  result.buildertrend_current);
                toast.success("Please wait until Buildertrend project updating finished.");
                return;
            }
            setStartBuildertrend(true);
        }
        else {
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

    const handleSendOptInPhone = async(customer_id, phone) => {
        if(phone === ""){
            toast.error("Can't find customer's phone number.");
            return
        }
        dispatch(loadingOn());
        const res = await sendOptInPhone(customer_id, 1);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }

    const handleSendOptIn = async(customer_id, email, phone ) => {
        handleSendOptInEmail(customer_id, email);
        handleSendOptInPhone(customer_id, phone);
    }

    const handleUpdateOptInPhoneStatus = async(customer_id, opt_in_status, phone) => {
        dispatch(loadingOn());
        const res = await sendOptInPhone(customer_id, opt_in_status);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }


    const handleUpdateOptInEmailStatus = async(customer_id, opt_in_status, email) => {
        dispatch(loadingOn());
        const res = await sendOptInEmail(customer_id, opt_in_status);
        dispatch(loadingOff());
        setRefetch(!refetch);
    }


    const handleUpdateOptInStatus = async(customer_id, opt_in_status, phone, email) => {
        handleUpdateOptInPhoneStatus(customer_id, opt_in_status, phone)
        handleUpdateOptInEmailStatus(customer_id, opt_in_status, email)
    }


    return (
        <div>
            <div className="w-[300px] pl-8 pt-8">
                <img src="Favicon.png" alt="logo" 
                    className="w-[100%] h-[100%]"
                />
            </div>

            <div className="pt-16">
                <div className="bg-white" style={{display: 'flex', alignItems: 'center', justifyContent: "center", fontSize: "15px !important"}}>
                    <div >
                        <BuildertrendScrapingStatus 
                            startBuildertrend={startBuildertrend}
                            setStartBuildertrend={setStartBuildertrend}
                        />
                    </div>
                    <div>
                        <XactanalysisScrapingStatus 
                            startXactanalysis={startXactanalysis}
                            setStartXactanalysis={setStartXactanalysis}
                            mode={"mobile"}
                        />
                    </div>
                    <RerunStatus
                        startRerun={startRerun}
                        setStartRerun={setStartRerun}
                    />
                </div>
                <div className="py-2 px-4 bg-red-700 mb-[1px]">
                    <p className="text-xl text-center font-semibold text-white">NOTIFICATIONS</p>
                </div>
                <div className="py-1 px-6 bg-green-700 mb-[1px] cursor-pointer" onClick={openSettingsModal}>
                    <div className="flex justify-center items-center h-full">
                        <img src={settingsIcon} alt="settingsIcon" className="w-8 h-8"/>
                    </div>
                </div>
                <div>
                    { 
                    data.map((item, dataIndex) => {
                        // console.log(item);
                        const colors = {};
                        item.data.forEach((childData) => {
                            let childStatus = 'REVIEW';
                            if (childData.message_status === 1) {
                                childStatus = 'REVIEW'
                            }else if (childData.message_status === 2) {
                                childStatus = 'QUED'
                            }else if (childData.message_status === 3) {
                                childStatus = 'SENT'
                            }
                            
                            if (!colors[childStatus]) {
                                colors[childStatus] = childStatus === 'REVIEW' ? 'bg-yellow-500' : childStatus === 'QUED' ? 'bg-yellow-300' : 'bg-green-300';
                            }
                        })
                    
                        return (
                            <React.Fragment key={`parent-${item.project_id}`}>
                                <div className={`p-2 flex justify-between border-t-[1px] border-t-gray-700 ${expandId === item.project_id ? "bg-red-700": "bg-gray-400"}`}>
                                    <div>
                                        {expandId === item.project_id ? <TbMinus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandId(null)}/> : 
                                            <TbPlus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandId(item.project_id)}/> }
                                    </div>
                                    <div
                                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}
                                        data-tooltip-id={`tooltip-opt-${item.customer_id}`}
                                        data-tooltip-html={`
                                            <div>
                                                <span  style="font-weight: bold">Email: </span>
                                                ${item.email ? item.email : "email not found"}
                                            </div>
                                            <div>
                                                <span  style="font-weight: bold">Phone: </span>
                                                ${item.phone ? item.phone: "phone not found"}
                                            </div>
                                        `}
                                    >
                                        <p className="text-lg font-semibold text-white">
                                            {item.last_name && item.first_name && `${item.last_name}, ${item.first_name}`}
                                        </p>
                                    </div>
                                    <Tooltip id={`tooltip-opt-${item.customer_id}`} place="bottom" />
                                    <div className='flex items-center gap-1' style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                        <div
                                            className={`bg-yellow-500 w-7 h-7 rounded-[50%] }`}
                                            style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}
                                        >
                                            <p style={{paddingRight:"5px"}}>{item.review}</p>
                                        </div>
                                        <div style={{marginLeft: '-13px'}}>
                                            {
                                                (item.opt_in_status_email == 0) && ((item.opt_in_status_phone == 0)) && (
                                                    <>
                                                        <div
                                                            className={`bg-white w-7 h-7 rounded-[50%] }`}
                                                            style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}
                                                            onClick={() => handleSendOptIn(item.customer_id, item.email, item.phone)}
                                                        >
                                                            <p>OPT</p>
                                                        </div>
                                                    </>
                                                )
                                            }
                                            {
                                                ((item.opt_in_status_email == 1 || item.opt_in_status_phone == 1) && item.opt_in_status_email < 2 && item.opt_in_status_phone < 2) && (
                                                    <div className={`bg-yellow-400 w-7 h-7 rounded-[50%] `} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}>
                                                        <p>OPT</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                ((item.opt_in_status_email == 2 || item.opt_in_status_phone == 2) && item.opt_in_status_email < 3 && item.opt_in_status_phone < 3) && (
                                                    <div className={`bg-green-400 w-7 h-7 rounded-[50%] `} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}>
                                                        <p>OPT</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                ((item.opt_in_status_email == 3 || item.opt_in_status_phone == 3) && item.opt_in_status_email < 4 && item.opt_in_status_phone < 4) && (
                                                    <div
                                                        className={`bg-red-500 w-7 h-7 rounded-[50%] `}
                                                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}
                                                        onClick={() => handleUpdateOptInStatus(item.customer_id, 4, item.phone, item.email)}
                                                    >
                                                        <p>OPT</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                ((item.opt_in_status_email == 4 || item.opt_in_status_phone == 4)) && (
                                                    <div
                                                        className={`bg-orange-500 w-7 h-7 rounded-[50%] `}
                                                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: "12px"}}
                                                    >
                                                        <p>OPT</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                // <div key={color} className={`${color} w-7 h-7 rounded-[50%] ${i !== 0 ? '-ml-4': ''}`} />
                                            }
                                        </div>

                                        {item.sending_method == 2 ? (<IoMdRefresh className="text-3xl text-green-500 cursor-pointer" onClick={() => handlerChangeCustomerStatus(item.customer_id, 1)}/>) : (
                                            <IoMdRefresh className="text-3xl text-white cursor-pointer" onClick={() => handlerChangeCustomerStatus(item.customer_id, 2)}/>)}
                                        <IoCloseSharp className="text-3xl text-white cursor-pointer" onClick={() => {
                                            handleDeleteCustomer(item.customer_id)
                                        }}/>
                                    </div>
                                </div>

                                {expandId === item.project_id && item.data.map((childData, childIndex) => {
                                    let childStatus = 'REVIEW';
                                    if (childData.message_status === 1) {
                                        childStatus = 'REVIEW'
                                    }else if (childData.message_status === 2) {
                                        childStatus = 'QUED'
                                    }else if (childData.message_status === 3) {
                                        childStatus = 'SENT'
                                    }
                                    return (
                                        <React.Fragment key={`child-${childData.project_id}`}>
                                            <div className={`p-2 flex justify-between ${childStatus === 'REVIEW' ? 'bg-yellow-500' : childStatus === 'QUED' ? 'bg-yellow-300' : 'bg-green-300'}`}>
                                                <div className='flex items-center gap-2'>
                                                    {expandChildId === childData.project_id ? <TbMinus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandChildId(null)}/> : 
                                                        <TbPlus className="text-3xl text-white font-bold cursor-pointer" onClick={() => setExpandChildId(childData.project_id)}/> }
                                                    
                                                        <p className="text-lg font-semibold">
                                                            {childStatus}
                                                        </p>
                                                </div>
                                                <div className="flex gap-3 items-center">
                                                    <p className='text-green-500 font-semibold'>{(childStatus === "QUED" && remainTime[dataIndex][childIndex]) && remainTime[dataIndex][childIndex]}</p> 
                                                    
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
                                                            <BsCheckLg className="text-3xl text-green-500 cursor-pointer -ml-4" />
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
                                                    <FiDownload className="text-3xl" />
                                                    {/* <AiOutlineMinusCircle className="text-3xl text-red-500" />  */}
                                                    { childStatus === 'REVIEW' && <AiFillDelete className="text-3xl text-red-500 cursor-pointer"
                                                        onClick={() => {
                                                            const res = confirm('Are you really sure to delete the message?')
                                                            if (res) {
                                                                handleDeleteMessage(childData.project_id)
                                                            }
                                                        }}
                                                    />}
                                                    { childStatus === 'QUED' && <FiMinusCircle className='text-2xl cursor-pointer text-red-500' 
                                                        onClick={() => handlerCancelQued(childData.project_id) }
                                                    />}
                                                    {/* { childStatus === 'SENT' && <AiFillLike className="text-2xl cursor-pointer"/> } */}
                                                </div>
                                            </div>

                                            {expandChildId === childData.project_id && (
                                                <div className='bg-white p-2 flex flex-col gap-1'>
                                                    <p className='font-light text-xl'>{childData.sent_timestamp ? moment(childData.sent_timestamp).format(DATE_FORMAT) : '-'}</p>
                                                    <p className='font-light text-xl'>{childData.claim_number}</p>
                                                    <div className='flex justify-between items-center'>
                                                        <p className='text-xl'>Message:</p>
                                                        <LuPencil className="text-xl text-gray-400 cursor-pointer" 
                                                            onClick={() => {
                                                                setTurnOnEdit(childData.project_id)
                                                                setEditMessage(childData.last_message || '')
                                                            }}
                                                        />
                                                    </div>
                                                    <p className='font-light text-xl'>{childData.last_message}</p>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </React.Fragment>  
                        )
                    })}
                </div>
            </div>

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
    )
}
