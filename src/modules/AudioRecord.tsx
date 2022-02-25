import React, { PropsWithChildren, useEffect, useState, useRef } from "react";
import Canvas from "./Canvas";

interface IAudioProps extends PropsWithChildren<any>{
    audioDuration?: number
}

const config = { mimeType: "audio/webm" };

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] | any = [];

const AudioRecord: React.FC<IAudioProps> = ({audioDuration}) => {
    //states
    const [globalStream, updateGlobalStream] = useState<any>(null);
    const [permissionMicro, updatePermissionMicro] = useState<boolean>(false);
    const [srcAudio, updateSrcAudio] = useState<string>("");
    const [isRecord, updateIsRecord] = useState<boolean>(false);
    const [isPause, updateIsPause] = useState<boolean>(false);
    const [sizeAudio, updateSizeAudio] = useState<number>(10);

    //Ref
    const isPausetRef = useRef(isPause);
    isPausetRef.current = isPause;
    const isRecordtRef = useRef(isRecord);
    isRecordtRef.current = isRecord;

    const intervalDuration: number =  (audioDuration ? audioDuration : 0 )  / 10;
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
            if (count >= intervalDuration) {
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
        mediaRecorder = new MediaRecorder(globalStream, config);

        // Event for save data recorered into array chunks.
        mediaRecorder.addEventListener("dataavailable", (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        });

        // Event stop where you can execute custom actions.
        mediaRecorder.addEventListener("stop", function () {
            // Create object url from blob.
            const objectRef = URL.createObjectURL(new Blob(recordedChunks));

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
                                    <div>{sizeAudio / 10}%  | max {(audioDuration ? audioDuration : 0 ) / 1000}s</div>
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
