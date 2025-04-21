import React from "react"
import { useEffect, useState } from "react";
import {ChatgptIcon} from "../../assets/chatgpt-icon.jsx";
import { checkScrapingStatus } from "../../services/notifications/index.js";
import toast from "react-hot-toast";

export const RerunStatus = ({startRerun, setStartRerun}) => {

    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [display, setDisplay] = useState('none');
    useEffect(() => {
        console.log("display: ", display)
        const interval = setInterval(() => {
            // if (startRerun) {
                checkScrapingStatus()
                    .then(response => response.json())
                    .then(result => {
                        setTotal(result.project_total);
                        setCurrent(result.project_current);
                        if (result.project_total === result.project_current) {
                            setDisplay('none');
                            if(result.project_total && startRerun) toast.success("Messages are updated Successfully!")
                            setStartRerun(false);
                            clearInterval(interval);
                        }
                        else setDisplay("flex")
                    });
            // }
        }, 15000); // Check status every 5 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [startRerun, setStartRerun, display, setDisplay, setTotal, total, setCurrent, current, setInterval,]);

    const rotatingStyle = {
        animation: 'spin 2s linear infinite',
        transformOrigin: '50% 50%' // This ensures the rotation is around the center
    };  

    const staticStyle = {};


    return(
        <div className="px-2 bg-white flex items-center mb-[1px]" style={{ minWidth: '20px', marginRight:"10px", display:display }}>
            <div style={total !== current ? rotatingStyle : staticStyle}>
                <ChatgptIcon />
            </div>
            <span style={{fontSize:"20px", marginLeft: "5px"}}>{current} / {total}</span>
        </div>
    )
}