import {WebSocketServer, WebSocket} from 'ws';

const wss = new WebSocketServer({port:8080});

interface userSocketType {
    socket:WebSocket;
    roomId: string
}
let usersSocket: userSocketType[] = []

wss.on("connection", (socket:WebSocket) => {

    socket.on("message", (message) => {
        const parseMessage = JSON.parse(message.toString());

        if(parseMessage.type==="join"){
            usersSocket.push({
                socket,
                roomId: parseMessage.roomId
            })
        }

        if(parseMessage.type==="chat"){
            const currentUserRoom = usersSocket.find((x:userSocketType) => x.socket == socket)?.roomId;
            const usersInCurrentRoom = usersSocket.filter((x:userSocketType) => x.roomId == currentUserRoom);

            usersInCurrentRoom.forEach((u:userSocketType) => u.socket.send(parseMessage.payload.message));
        }
    
    })
    
    socket.on("close", () => {
        usersSocket = usersSocket.filter((u:userSocketType) => u.socket !== socket);
    })

})