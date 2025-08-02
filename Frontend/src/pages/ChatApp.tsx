import { useEffect, useRef, useState } from "react";
import { Lobby, ChatRoom } from "../components";

interface payloadType {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Message {
  type: string;
  payload: payloadType;
}

const ChatApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'lobby' | 'chat'>('lobby');
  const [roomName, setRoomName] = useState('');
  const [user, setUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  const initializeWebSocket = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve(wsRef.current);
        return;
      }

      setIsConnecting(true);
      setConnectionError('');

      const ws = new WebSocket("ws://localhost:8080");
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Connection timeout"));
      }, 5000); // 5 second timeout

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        wsRef.current = ws;
        resolve(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);
          
          switch (data.type) {
            case "room_created":
              console.log("Room created successfully:", data.payload.roomId);
              break;
              
            case "room_joined":
              console.log("Joined room successfully:", data.payload.roomId);
              break;
              
            case "user_joined":
              console.log("User joined:", data.payload.username);
              // Add system message for user joining
              const joinMessage: Message = {
                type: "system",
                payload: {
                  id: Date.now().toString(),
                  username: "System",
                  content: data.payload.message,
                  timestamp: new Date(),
                  isOwn: false
                }
              };
              setMessages(prev => [...prev, joinMessage]);
              break;
              
            case "user_left":
              console.log("User left:", data.payload.username);
              // Add system message for user leaving
              const leaveMessage: Message = {
                type: "system",
                payload: {
                  id: Date.now().toString(),
                  username: "System",
                  content: data.payload.message,
                  timestamp: new Date(),
                  isOwn: false
                }
              };
              setMessages(prev => [...prev, leaveMessage]);
              break;
              
            case "chat_message":
              // Add received message to the chat
              const receivedMessage: Message = {
                type: "chat",
                payload: {
                  id: Date.now().toString(),
                  username: data.payload.username,
                  content: data.payload.message,
                  timestamp: new Date(data.payload.timestamp),
                  isOwn: data.payload.username === user
                }
              };
              setMessages(prev => [...prev, receivedMessage]);
              break;
              
            case "error":
              console.error("Server error:", data.payload.message);
              setConnectionError(data.payload.message);
              break;
              
            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError("Failed to connect to server");
        reject(error);
      };
    });
  };

  // Check if room exists via REST API
  const checkRoomExists = async (roomId: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/exists`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking room existence:", error);
      return false;
    }
  };

  const handleCreateRoom = async (newRoomName: string) => {
    try {
      setConnectionError('');
      
      // Connect to WebSocket
      const ws = await initializeWebSocket();
      
      // Send create room message
      ws.send(JSON.stringify({
        type: "create",
        payload: {
          username: user,
          roomId: newRoomName,
        }
      }));
      
      setRoomName(newRoomName);
      setMessages([]); // Clear previous messages
      setCurrentView('chat');
      
    } catch (error) {
      console.error("Failed to create room:", error);
      setConnectionError("Failed to connect to server. Please try again.");
    }
  };

  const handleJoinRoom = async (newRoomName: string) => {
    try {
      setConnectionError('');
      
      // First check if room exists
      const roomExists = await checkRoomExists(newRoomName);
      
      if (!roomExists) {
        setConnectionError(`Room "${newRoomName}" does not exist`);
        return;
      }
      
      // Connect to WebSocket
      const ws = await initializeWebSocket();
      
      // Send join room message
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          username: user,
          roomId: newRoomName,
        }
      }));
      
      setRoomName(newRoomName);
      setMessages([]); // Clear previous messages
      setCurrentView('chat');
      
    } catch (error) {
      console.error("Failed to join room:", error);
      setConnectionError("Failed to connect to server. Please try again.");
    }
  };

  const handleBackToLobby = () => {
    // Disconnect WebSocket when leaving room
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setCurrentView('lobby');
    setMessages([]);
    setRoomName('');
    setIsConnected(false);
    setConnectionError('');
  };

  const handleSendMessage = (content: string) => {
    if (!wsRef.current || !isConnected) {
      console.error("WebSocket not connected");
      setConnectionError("Connection lost. Please rejoin the room.");
      return;
    }

    // Send message to server
    wsRef.current.send(JSON.stringify({
      type: "chat",
      payload: {
        message: content
      }
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (currentView === 'lobby') {
    return (
      <Lobby
        user={user}
        onUserChange={setUser}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isConnecting={isConnecting}
        connectionError={connectionError}
      />
    );
  }

  return (
    <ChatRoom
      roomName={roomName}
      messages={messages}
      onBackToLobby={handleBackToLobby}
      onSendMessage={handleSendMessage}
      isConnected={isConnected}
      connectionError={connectionError}
    />
  );
};

export default ChatApp;