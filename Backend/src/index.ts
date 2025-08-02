import {WebSocketServer, WebSocket} from 'ws';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({port: 8080});
interface userSocketType {
    socket: WebSocket;
    roomId: string;
    username: string;
}

let usersSocket: userSocketType[] = [];
let activeRooms: Set<string> = new Set(); // Track active rooms

// REST API endpoint to check if room exists
app.get('/api/rooms/:roomId/exists', (req, res) => {
    const { roomId } = req.params;
    const roomExists = activeRooms.has(roomId);
    
    res.json({ 
        exists: roomExists,
        roomId: roomId,
        userCount: roomExists ? usersSocket.filter(u => u.roomId === roomId).length : 0
    });
});

// Get all active rooms
app.get('/api/rooms', (req, res) => {
    const rooms = Array.from(activeRooms).map(roomId => ({
        roomId,
        userCount: usersSocket.filter(u => u.roomId === roomId).length
    }));
    
    res.json({ rooms });
});

wss.on("connection", (socket: WebSocket) => {
    console.log("New client connected");

    socket.on("message", (message) => { 
        try {
            const parseMessage = JSON.parse(message.toString());
            console.log("Received message:", parseMessage);

            if (parseMessage.type === "create") {
                const { roomId, username } = parseMessage.payload;
                
                // Check if room already exists
                if (activeRooms.has(roomId)) {
                    socket.send(JSON.stringify({
                        type: "error",
                        payload: {
                            message: `Room ${roomId} already exists. Please choose a different name.`
                        }
                    }));
                    return;
                }

                // Create new room
                activeRooms.add(roomId);
                
                const existingUser = usersSocket.find(u => u.socket === socket);
                if (existingUser) {
                    existingUser.roomId = roomId;
                    existingUser.username = username;
                } else {
                    usersSocket.push({ socket, username, roomId });
                }

                socket.send(JSON.stringify({
                    type: "room_created",
                    payload: {
                        roomId,
                        username,
                        message: `Room ${roomId} created successfully`,
                        isOwner: true
                    }
                }));

                console.log(`Room ${roomId} created by ${username}`);
            }

            if (parseMessage.type === "join") {
                const { roomId, username } = parseMessage.payload;
                
                // Check if room exists
                if (!activeRooms.has(roomId)) {
                    socket.send(JSON.stringify({
                        type: "error",
                        payload: {
                            message: `Room ${roomId} does not exist`
                        }
                    }));
                    return;
                }

                const existingUser = usersSocket.find(u => u.socket === socket);
                if (existingUser) {
                    existingUser.roomId = roomId;
                    existingUser.username = username;
                } else {
                    usersSocket.push({ socket, username, roomId });
                }

                // Send confirmation to the user who joined
                socket.send(JSON.stringify({
                    type: "room_joined",
                    payload: {
                        roomId,
                        username,
                        message: `Successfully joined room ${roomId}`,
                        isOwner: false
                    }
                }));

                // Notify other users in the room
                const usersInRoom = usersSocket.filter(u => 
                    u.roomId === roomId && u.socket !== socket
                );
                
                usersInRoom.forEach(u => {
                    u.socket.send(JSON.stringify({
                        type: "user_joined",
                        payload: {
                            username,
                            message: `${username} joined the room`
                        }
                    }));
                });

                console.log(`${username} joined room ${roomId}`);
            }

            if (parseMessage.type === "chat") {
                const currentUser = usersSocket.find(u => u.socket === socket);
                
                if (currentUser) {
                    const usersInCurrentRoom = usersSocket.filter(u => u.roomId === currentUser.roomId);

                    usersInCurrentRoom.forEach(u => {
                        u.socket.send(JSON.stringify({
                            type: "chat_message",
                            payload: {
                                username: currentUser.username,
                                message: parseMessage.payload.message,
                                roomId: currentUser.roomId,
                                timestamp: new Date().toISOString()
                            }
                        }));
                    });

                    console.log(`Message from ${currentUser.username} in room ${currentUser.roomId}: ${parseMessage.payload.message}`);
                }
            }

        } catch (error) {
            console.error("Error parsing message:", error);
            socket.send(JSON.stringify({
                type: "error",
                payload: {
                    message: "Invalid message format"
                }
            }));
        }
    });
    
    socket.on("close", () => {
        const disconnectedUser = usersSocket.find(u => u.socket === socket);
        
        if (disconnectedUser) {
            const { roomId, username } = disconnectedUser;
            
            // Remove user from the room
            usersSocket = usersSocket.filter(u => u.socket !== socket);
            
            // Check if room is now empty and remove it
            const remainingUsersInRoom = usersSocket.filter(u => u.roomId === roomId);
            if (remainingUsersInRoom.length === 0) {
                activeRooms.delete(roomId);
                console.log(`Room ${roomId} deleted - no users remaining`);
            } else {
                // Notify remaining users
                remainingUsersInRoom.forEach(u => {
                    u.socket.send(JSON.stringify({
                        type: "user_left",
                        payload: {
                            username,
                            message: `${username} left the room`
                        }
                    }));
                });
            }

            console.log(`${username} disconnected from room ${roomId}`);
        }

        console.log("#users:", usersSocket.length);
        console.log("#active rooms:", activeRooms.size);
    });
});

// Start both servers
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`REST API server running on port ${PORT}`);
});

console.log("WebSocket server running on port 8080");