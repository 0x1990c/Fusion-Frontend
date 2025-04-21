import { useEffect, useState } from "react";
import {BuildertrendIcon} from "../../assets/buildertrend-icon.jsx";
import { checkScrapingStatus } from "../../services/notifications/index.js";
import toast from "react-hot-toast";

export const BuildertrendScrapingStatus = ({startBuildertrend, setStartBuildertrend, startRerun, setStartRerun}) => {

    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [display, setDisplay] = useState('none');
    console.log("startBuildertrend---", startBuildertrend)
    useEffect(() => {
        const interval = setInterval(() => {
            // if (startBuildertrend){
                checkScrapingStatus()
                    .then(response => response.json())
                    .then(result => {
                        setTotal(result.buildertrend_total);
                        setCurrent(result.buildertrend_current);
                        console.log(startBuildertrend)
                        if (result.buildertrend_total === result.buildertrend_current) {
                            setDisplay('none');
                            if(result.buildertrend_total && startBuildertrend) {
                                toast.success("Buildertrend projects have been updated Successfully!")
                                setStartRerun(true);
                                toast.success("Message generating started!")
                            }
                            setStartBuildertrend(false);
                            
                            clearInterval(interval);
                        }
                        else setDisplay("flex")
                    });
            // }
        }, 15000); // Check status every 5 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [startBuildertrend, setStartBuildertrend, display, setDisplay, setTotal, total, setCurrent, current, setInterval, startRerun, setStartRerun]);

    const rotatingStyle = {
        animation: 'spin 2s linear infinite',
        transformOrigin: '50% 50%' // This ensures the rotation is around the center
    };  

    const staticStyle = {};


    return(
        <div className="px-2 bg-white flex items-center mb-[1px]" style={{ minWidth: '20px', marginRight:"10px", display:display }}>
            <div style={total !== current ? rotatingStyle : staticStyle}>
                <BuildertrendIcon />
            </div>
            <span style={{fontSize:"20px", marginLeft: "5px"}}>{current} / {total}</span>
        </div>
    )
}