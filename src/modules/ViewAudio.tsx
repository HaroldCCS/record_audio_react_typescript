import React, { useEffect, useState, useRef } from "react";
import "./audio.scss";
import {AiFillPlayCircle, AiFillPauseCircle} from "react-icons/ai"
import {IoMdTrash} from "react-icons/io"


interface IViewAudioProps {
    audioLink: string
}

function secondsToString(seconds : number) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return "00:00"
    }
    let minute : any= Math.floor((seconds / 60) % 60);
    minute = (minute < 10)? '0' + minute : minute;
    let second : any= seconds % 60;
    second = (second < 10)? '0' + Math.round(second) : second;
    return minute + ':' + second;
  }


//https://uploads-kuepa.s3.us-west-2.amazonaws.com/alliance/talk_channel/audio/7cEJ4L9g8hNhAiktVliU.webm
const tamañoBar = 170;

const ViewAudio: React.FC<IViewAudioProps> = ({audioLink}) => {
    const [isPause, updateIsPause] = useState<boolean>(true)
    //const [audioData2, updateAudioData2] = useState<HTMLAudioElement>(new Audio("https://uploads-kuepa.s3.us-west-2.amazonaws.com/alliance/talk_channel/audio/7cEJ4L9g8hNhAiktVliU.webm"))
    const [audioData, updateAudioData] = useState<any>(false)
    const [timeDuration, updatetimeDuration] = useState<any>("00:00")

    //barra de tiempo
    let [percentRange, updatePercentRange] = useState<number>(0)
    let [secondRange, updateSecondRange] = useState<number>(0)
    let [constTime, updateConstTime] = useState<number>(0)

    const isPausetRef = useRef(isPause);
    isPausetRef.current = isPause;

    const lapsoTime = ( e: any) => { 
        console.log(e.pageX)
        updateSecondRange(((Math.abs((e.pageX * 100) / tamañoBar) - percentRange)  * constTime) / 100)
        updatePercentRange(e.pageX / 10)
    }

    const listen = (value: boolean) => {

        if (value) {
            audioData.pause()
            console.log("currentTime", audioData.currentTime)
            console.log((audioData.currentTime * tamañoBar) / constTime)

            updatePercentRange( ((audioData.currentTime * 1000) * tamañoBar) / constTime)
        } else {
            updatePercentRange(100)
            audioData.play()
            timePlayed(false)
        }

        updateIsPause(value)
        //console.log(audioData.ariaSetSize)
        //console.log(secondsToString(audioData.duration))
    }

    useEffect(() => {
        updateAudioData(new Audio(audioLink))
    },[audioLink])

    useEffect(() => {
        console.log(audioData)
        if(audioData){
            setTimeout(() => {
                updateConstTime(audioData.duration * 1000)
                updateSecondRange(audioData.duration * 1000)
                updatetimeDuration(secondsToString(audioData.duration))
            }, 500);
        }
    },[audioData])


    const timePlayed = (value: boolean = true) => {
        console.log(isPausetRef.current)
        const asdf = value ?  isPausetRef.current : false
        if (asdf) return
        
        setTimeout(() => {
            audioData.duration === audioData.played.end(0) && (updateIsPause(true) )
            timePlayed()
        }, 1000);
    }
    return (
        <div className="container-audio">
            <div className="container-buttom">
                {
                    isPause ?
                    < AiFillPlayCircle onClick={()=> listen(false)} style={{color:"rgb(255, 136, 0)", fontSize: "1.8rem" }} />
                    :
                    < AiFillPauseCircle onClick={()=> listen(true)}  style={{color:"rgb(255, 136, 0)", fontSize: "1.8rem" }} />
                }
            </div>
            <div className="container-progress">
                <div className="progress-bar" onClick={(e) => lapsoTime(e)}>
                    <ProgressBar percentRange={percentRange} secondRange={secondRange} />
                </div>
                <div className="duration-audio">{timeDuration}</div>
                <div className="date-audio">13/05/21 - 10:35</div>

            </div>
            < IoMdTrash className="container-trash"  style={{fontSize: "1rem" }} />
        </div>

    )
}

const ProgressBar = (props: any) => {
    console.log(props)
    const barTransition = () => {
        if (props.percentRange !== 100) return 0
        
        return props.secondRange
    }

    return (
        <div className="progress-bar-audio" style={{width: `${props.percentRange}%`, transition: `${barTransition()}ms`}}/>
    )
}

export default ViewAudio;