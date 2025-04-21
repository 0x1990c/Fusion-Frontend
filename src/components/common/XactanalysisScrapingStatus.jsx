import { useEffect, useState } from "react";
import {XactanalysisIcon} from "../../assets/xactanalysis-icon.jsx";
import { checkScrapingStatus } from "../../services/notifications/index.js";
import toast from "react-hot-toast";

export const XactanalysisScrapingStatus = ({startXactanalysis, setStartXactanalysis, startRerun, setStartRerun, mode}) => {
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0);
    const [display, setDisplay] = useState('none');

    useEffect(() => {
        const interval = setInterval(() => {
            // if (startXactanalysis){
                checkScrapingStatus()
                    .then(response => response.json())
                    .then(result => {
                        setTotal(result.xactanalysis_total);
                        setCurrent(result.xactanalysis_current);
                        
                        if (result.xactanalysis_total === result.xactanalysis_current) {
                            setDisplay('none');
                            if(result.xactanalysis_total && startXactanalysis) {
                                toast.success("Xactanalysis projects have been updated Successfully!");
                                setStartRerun(true);
                                toast.success("Message generating started!");
                            }
                            setStartXactanalysis(false);
                            clearInterval(interval);
                        }
                        else setDisplay("flex")
                    });
                // }z
        }, 15000); // Check status every 5 seconds

        return () => clearInterval(interval); // Clear interval on component unmount
    }, [startXactanalysis, setStartXactanalysis, setDisplay, startRerun, setStartRerun, setTotal, total, setCurrent, current, setInterval,]);

    const rotatingStyle = {
        animation: 'spin 2s linear infinite',
        transformOrigin: '50% 50%' // This ensures the rotation is around the center
    };

    const staticStyle = {};

    return(
        <div className="px-2 bg-white flex items-center mb-[1px]" style={{ minWidth: '20px', marginRight: '10px', display:display}}>
            <div style={total !== current ? rotatingStyle : staticStyle}>
                <XactanalysisIcon
                    mode = {mode}
                />
            </div>
            <span style={{fontSize:"20px", marginLeft: '5px'}}> {current} / {total}</span>
        </div>
    )
}