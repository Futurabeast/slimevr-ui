import { useState } from "react";
import { RpcMessage } from "slimevr-protocol";
import { RecordBVHRequestT } from "slimevr-protocol/protocol/typescript/dist/slimevr-protocol/rpc/record-bvhrequest";
import { RecordBVHStatusT } from "slimevr-protocol/protocol/typescript/dist/slimevr-protocol/rpc/record-bvhstatus";
import { useWebsocketAPI } from "../hooks/websocket-api";
import { BigButton } from "./commons/BigButton";
import { RecordIcon } from "./commons/icon/RecordIcon";

export function BVHButton() {
    const { useRPCPacket, sendRPCPacket } = useWebsocketAPI();
    const [recording, setRecording] = useState(false);

    const toggleBVH = () => {
        const record = new RecordBVHRequestT();
        record.stop = recording;
        sendRPCPacket(RpcMessage.RecordBVHRequest, record)
    }

    useRPCPacket(RpcMessage.RecordBVHStatus, (data: RecordBVHStatusT) => {
        setRecording(data.recording);
        console.log('receiving', data);
    })

    return (
        <BigButton text={recording ? 'Recording...' : 'Record BVH'} icon={<RecordIcon />} onClick={toggleBVH}></BigButton>
    )
}