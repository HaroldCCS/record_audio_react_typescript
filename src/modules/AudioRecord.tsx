import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";

interface IAudioProps {}

const config = { mimeType: "audio/webm" };

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] | any = [];

const AudioRecord: React.FC<IAudioProps> = (props) => {
    const [globalStream, updateGlobalStream] = useState<any>(null);
    const [permissionMicro, updatePermissionMicro] = useState<boolean>(false);
    const [srcAudio, updateSrcAudio] = useState<string>("");
    const [isRecord, updateIsRecord] = useState<boolean>(false);
    const [isPause, updateIsPause] = useState<boolean>(false);

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

export default AudioRecord;
