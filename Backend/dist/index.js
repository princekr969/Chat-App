import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
let usersSocket = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parseMessage = JSON.parse(message.toString());
        if (parseMessage.type === "join") {
            usersSocket.push({
                socket,
                roomId: parseMessage.roomId
            });
        }
        if (parseMessage.type === "chat") {
            const currentUserRoom = usersSocket.find((x) => x.socket == socket)?.roomId;
            const usersInCurrentRoom = usersSocket.filter((x) => x.roomId == currentUserRoom);
            usersInCurrentRoom.forEach((u) => u.socket.send(parseMessage.payload.message));
        }
    });
    socket.on("close", () => {
        usersSocket = usersSocket.filter((u) => u.socket !== socket);
    });
});
//# sourceMappingURL=index.js.map