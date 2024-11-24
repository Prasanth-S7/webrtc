// Receiver.tsx
import { useEffect, useRef } from "react";

export default function Receiver() {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        let pc: RTCPeerConnection | null = null;

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            if (message.type === "create-offer") {
                pc = new RTCPeerConnection();

                pc.onicecandidate = (event) => {
                    console.log("ICE candidate generated:", event.candidate);
                    if (event.candidate) {
                        socket.send(JSON.stringify({ type: "ice-candidate", sdp: event.candidate }));
                    }
                };

                pc.ontrack = (event) => {
                    console.log("Track received:", event.track.kind);
                    if (videoRef.current && event.streams && event.streams[0]) {
                        videoRef.current.srcObject = event.streams[0];
                    }
                };

                await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.send(JSON.stringify({ 
                    type: "create-answer", 
                    sdp: pc.localDescription 
                }));
            } else if (message.type === "ice-candidate" && pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(message.sdp));
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            }
        };

        return () => {
            if (videoRef.current) {
                const stream = videoRef.current.srcObject as MediaStream;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                videoRef.current.srcObject = null;
            }
            socket.close();
            if (pc) pc.close();
        };
    }, []);

    return (
        <div>
            <div className="h-screen flex flex-col justify-center items-center bg-black">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    muted
                    controls
                    className="rounded-lg border-2 border-blue-400" 
                    style={{ width: "600px", height: "400px", background: "black" }}
                />
            </div>
        </div>
    );
}