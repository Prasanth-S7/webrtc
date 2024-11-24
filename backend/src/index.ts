import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null
let receiverSocket: null | WebSocket = null

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);


  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);

    if(message.type === "sender"){
        senderSocket = ws;
        console.log("sender set")
    }
    else if(message.type === "receiver"){
        receiverSocket = ws;
        console.log("receiver set")
    }
    else if (message.type === "create-offer"){
        console.log(message)
        if(ws !== senderSocket) return 
        receiverSocket?.send(JSON.stringify({type: "create-offer", sdp: message.sdp}))
        console.log("offer received")
    }
    else if (message.type === "create-answer"){
        if(ws !== receiverSocket) return
        senderSocket?.send(JSON.stringify({type:"create-answer", sdp: message.sdp}))
        console.log("answer received")
    }
    else if (message.type === "ice-candidate"){
        if(ws === senderSocket){
            receiverSocket?.send(JSON.stringify({type: "ice-candidate", sdp: message.sdp}))
        }
        else if(ws === receiverSocket){
            senderSocket?.send(JSON.stringify({type: "ice-candidate", sdp: message.sdp}))
        }
    }
  });
});
