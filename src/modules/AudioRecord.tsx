import React, { PropsWithChildren, useEffect, useState, useRef } from "react";
import Canvas from "./Canvas";

interface IAudioProps extends PropsWithChildren<any>{
    audioDuration?: number
}

const config =
( () => {
    if(MediaRecorder.isTypeSupported( "audio/webm")){
        return { mimeType: "audio/webm" };
    } else if(MediaRecorder.isTypeSupported( "audio/ogg")){
        return { mimeType: "audio/ogg" };
    } else {
        return { mimeType: "audio/webm" };
    }
})

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] | any = [];

const AudioRecord: React.FC<IAudioProps> = ({audioDuration}) => {
    //states
    const [globalStream, updateGlobalStream] = useState<any>(null);
    const [permissionMicro, updatePermissionMicro] = useState<boolean>(false);
    const [srcAudio, updateSrcAudio] = useState<string>("");
    const [isRecord, updateIsRecord] = useState<boolean>(false);
    const [isPause, updateIsPause] = useState<boolean>(false);
    const [sizeAudio, updateSizeAudio] = useState<number>(0);

    //Ref
    const isPausetRef = useRef(isPause);
    isPausetRef.current = isPause;
    const isRecordtRef = useRef(isRecord);
    isRecordtRef.current = isRecord;

    const intervalDuration = () : number => {
        return durationTime((audioDuration ? audioDuration : 0 )  / 10)
    }

    const durationTime = (value: number) :number => {
        if ("audio/ogg" === config().mimeType) {
            value /= 3;
        } 
        console.log(value)
        return value
    }
    
    //validate microphone
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                stream.active
                    ? updatePermissionMicro(true)
                    : updatePermissionMicro(false);
                updateGlobalStream(stream);
            });
    }, [permissionMicro]);


    const countDuration = (value: number, pauseds: boolean = true) => {
        const validationRecord  = isRecordtRef.current === false && value === 0 ? true : isRecordtRef.current 
        const validationPaused  = pauseds ? isPausetRef.current : false
        if (validationRecord && !validationPaused) {

            let count = value + 50;
            if (count >= intervalDuration() + 50) {
                updateSizeAudio(count)
                handlerEnd()
            } else {
                setTimeout(() => {
                    updateSizeAudio(count)
                    countDuration(count)
                }, 500);
            }
        }
    }

    const handlerStart = () => {
        updateIsRecord(true);
        // Add class animation loop.

        // Init instance MediaRecorder.
        mediaRecorder = new MediaRecorder(globalStream, config());

        // Event for save data recorered into array chunks.
        mediaRecorder.addEventListener("dataavailable", (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        });

        // Event stop where you can execute custom actions.
        mediaRecorder.addEventListener("stop", function () {
            // Create object url from blob.
            const objectRef = URL.createObjectURL(new Blob(recordedChunks, {type: config().mimeType}));

            updateSrcAudio(objectRef);

            // Reset instance recorder.
            mediaRecorder = null;
            recordedChunks = [];
        });

        // Event start where you can execute custom actions.
        mediaRecorder.addEventListener("start", function () {
            //console.log("addEventListener start");
        });

        // Event error where you can execute custom actions.
        mediaRecorder.addEventListener("error", function (err) {
            console.error("addEventListener error", err);
        });

        // Start recorder event of media recorder instance.
        mediaRecorder.start();

        countDuration(0);
    };

    const handlerEnd = () => {
        // Stop recorder event of media recorder instance.
        mediaRecorder?.stop();
        updateIsRecord(false);
    };


    const handlerDelete = () => {
        updateSrcAudio("")
    };


    const handlerPause = (value: boolean) => {
        if (value) {
            mediaRecorder?.pause();
            updateIsPause(true)

        } else {
            mediaRecorder?.resume();
            updateIsPause(false)
            countDuration(sizeAudio, false)
        }
    }


    return (
        <div>
            <h1>Grabar audio</h1>

            <p>Duracion del audio: 10s</p>
            <p>Dato curioso: el formato ogg pesa 3 veces mas que webm</p>
            <p>Para el ejemplo, si no soporta webm, se usara ogg pero el tiempo se dividira en 3</p>
            <hr />
            <br />
            esto es un audio en formato webm, por favor confirmar si se logra escuchar en safari movil
            <br />
            <audio controls  src="https://uploads-kuepa.s3.us-west-2.amazonaws.com/alliance/talk_channel/audio/7nFqyLppLuolRgiyr5i5.webm"/>
                <br/>
                <hr />

            <p>
                ¿Formato webm es soportado? : {MediaRecorder.isTypeSupported( "audio/webm") ? "Si" : "No"}
            </p>            
            <p>
                ¿Formato ogg es soportado? : {MediaRecorder.isTypeSupported( "audio/ogg") ? "Si" : "No"}
            </p>

            <hr />

            {permissionMicro ? (
                <>
                    {!isRecord ? (
                        <button onClick={() => handlerStart()}>
                            {srcAudio ? "Grabar de nuevo" : "Grabar"}
                        </button>
                    ) : (
                        <>
                            <button onClick={() => handlerEnd()}>
                                Detener
                            </button>

                            {!isPause ? (
                                <>
                                    <button onClick={() => handlerPause(true)}>
                                        Pausar
                                    </button>

                                    <br />
                                    <Canvas />
                                    <div>{Math.round(sizeAudio / 100)}s  | max {Math.round((durationTime(audioDuration ? audioDuration : 0 )) / 1000)}s</div>
                                </>
                            ) : (
                                <button onClick={() => handlerPause(false)}>
                                    Des pausar
                                </button>
                            )}
                        </>
                    )}
                    <br />
                    <br />
                    <br />

                    {srcAudio && 
                    <>
                        <audio controls src={srcAudio} />
                        <button onClick={() => handlerDelete()}>
                            Eliminar audio
                        </button>
                    </>
                    }
                </>
            ) : (
                <p>No tenemos el permiso del navegador para grabar audio :(</p>
            )}
        </div>
    );
};


AudioRecord.defaultProps = {
    audioDuration: 10000
}

export default AudioRecord;
