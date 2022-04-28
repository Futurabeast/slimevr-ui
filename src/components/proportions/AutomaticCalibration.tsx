import { useState } from "react";
import { AutoBoneEpochT, AutoBoneProcessRequestT, AutoBoneProcessStatusT, AutoBoneProcessType, RpcMessage } from "solarxr-protocol";
import { useWebsocketAPI } from "../../hooks/websocket-api";
import { Button } from "../commons/Button";
import { AppModal } from "../Modal";


export function AutomaticCalibration() {

    const [isOpen, setOpen] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [hasCalibration, setHasCalibration] = useState(false);

    const { useRPCPacket, sendRPCPacket } = useWebsocketAPI();

    const startProcess = (processType: AutoBoneProcessType) => {
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
        if (data.processType) {
            if (data.message) {
                console.log(data.processType, data.message);
            }

            if (data.completed) {
                console.log("Process ", data.processType, " has completed");

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
        if (data.currentEpoch && data.totalEpochs) {
            if (data.epochError) {
                // Probably not necessary to show to the user
                console.log("Epoch ", data.currentEpoch, "/", data.totalEpochs, " (Error ", data.epochError, ")");
            }

            // Progress bar?
        }

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
                    <Button variant="primary" onClick={startRecording}>Start Recording</Button>
                    <Button variant="primary" onClick={() => startProcess(AutoBoneProcessType.SAVE)} disabled={!hasRecording}>Save Recording</Button>
                    <Button variant="primary" onClick={startProcessing}>Start Calibration</Button>
                    </div>
                    <div className="flex w-full justify-between mt-5">
                        <Button variant="primary" onClick={() => setOpen(false)}>Close</Button>
                        <Button variant="primary" onClick={() => startProcess(AutoBoneProcessType.APPLY)} disabled={!hasCalibration}>Apply values</Button>
                    </div>
                </>
            </AppModal>
        </>
    )

}