import { useEffect, useState } from "react";

export default function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:8080");
        newSocket.onopen = () => {
            newSocket.send(JSON.stringify({ type: "sender" }));
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
            if (pc) {
                pc.close();
            }
        };
    }, []);

    const createOffer = async () => {
        if (!socket) return;

        const newPc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });
        setPc(newPc);

        newPc.onnegotiationneeded = async () => {
            console.log("onnegotiation needed on the sender side");
            const offer = await newPc.createOffer();
            await newPc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: "create-offer", sdp: newPc.localDescription }));
        };

        newPc.onicecandidate = (event) => {
            console.log("onicecandidate on the sender side");
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "ice-candidate", sdp: event.candidate }));
            }
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "create-answer") {
                await newPc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (data.type === "ice-candidate") {
                await newPc.addIceCandidate(new RTCIceCandidate(data.sdp));
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => {
                newPc.addTrack(track, stream);
            });
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-black">
            <button 
                className="rounded-xl text-white font-mono bg-blue-400 px-4 py-4" 
                onClick={createOffer}
            >
                Sender
            </button>
        </div>
    );
}