import classNames from "classnames";
import { useState } from "react";
import { AutoBoneEpochT, AutoBoneProcessRequestT, AutoBoneProcessStatusT, AutoBoneProcessType, RpcMessage } from "solarxr-protocol";
import { useWebsocketAPI } from "../../hooks/websocket-api";
import { Button } from "../commons/Button";
import { AppModal } from "../Modal";


export function AutomaticCalibration() {

    const [isOpen, setOpen] = useState(false);
    const [isProcessRunning, setProcessRunning] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [hasCalibration, setHasCalibration] = useState(false);
    const [progress, setProgress] = useState(0);

    const { useRPCPacket, sendRPCPacket } = useWebsocketAPI();

    const startProcess = (processType: AutoBoneProcessType) => {
        // Don't allow multiple processes at once (for now atleast)
        if (isProcessRunning) {
            return;
        }

        setProcessRunning(true);
        setProgress(0);

        const processRequest = new AutoBoneProcessRequestT();
        processRequest.processType = processType;
        
        sendRPCPacket(RpcMessage.AutoBoneProcessRequest, processRequest)
    }

    const startRecording = () => {
        setHasRecording(false);
        startProcess(AutoBoneProcessType.RECORD);
    }

    const startProcessing = () => {
        setHasCalibration(false);
        startProcess(AutoBoneProcessType.PROCESS);
    }

    useRPCPacket(RpcMessage.AutoBoneProcessStatus, (data: AutoBoneProcessStatusT) => {
        if (data.completed) {
            setProcessRunning(false);
            setProgress(1);
        }

        if (data.processType) {
            if (data.message) {
                console.log(AutoBoneProcessType[data.processType], ": ", data.message);
            }

            if (data.total > 0 && data.current >= 0) {
                setProgress(data.current / data.total);
            }

            if (data.completed) {
                console.log("Process ", AutoBoneProcessType[data.processType], " has completed");

                switch (data.processType) {
                    case AutoBoneProcessType.RECORD:
                        setHasRecording(data.success);
                        break;

                    case AutoBoneProcessType.PROCESS:
                        setHasCalibration(data.success);
                        break;
                }
            }
        }
    })

    useRPCPacket(RpcMessage.AutoBoneEpoch, (data: AutoBoneEpochT) => {
        setProgress(data.currentEpoch/data.totalEpochs);

        // Probably not necessary to show to the user
        console.log("Epoch ", data.currentEpoch, "/", data.totalEpochs, " (Error ", data.epochError, ")");

        if (data.adjustedSkeletonParts) {
            // Display measurements
        }
    })

    return (
        <>
            <Button variant="primary" onClick={() => setOpen(true)}>Automatic calibration</Button>
            <AppModal 
                isOpen={isOpen} 
                name={<>Automatic Calibration</>} 
                onRequestClose={() => setOpen(false)}
            >
                <>
                    <div className="flex w-full justify-center gap-3">
                    <Button variant="primary" onClick={startRecording} disabled={isProcessRunning}>Start Recording</Button>
                    <Button variant="primary" onClick={() => startProcess(AutoBoneProcessType.SAVE)} disabled={isProcessRunning || !hasRecording}>Save Recording</Button>
                    <Button variant="primary" onClick={startProcessing} disabled={isProcessRunning}>Start Calibration</Button>
                    </div>
                    <div className="flex flex-col w-full h-12 p-2">
                        <div className="w-full rounded-full h-full overflow-hidden relative bg-fuchsia-900">
                            <div className={classNames("h-full top-0 left-0 bg-fuchsia-400", { 'transition-all': progress > 0})} style={{width: `${progress * 100}%`}}></div>
                        </div>
                    </div>
                    <div className="flex w-full justify-between mt-3">
                        <Button variant="primary" onClick={() => setOpen(false)}>Close</Button>
                        <Button variant="primary" onClick={() => startProcess(AutoBoneProcessType.APPLY)} disabled={isProcessRunning || !hasCalibration}>Apply values</Button>
                    </div>
                </>
            </AppModal>
        </>
    )

}