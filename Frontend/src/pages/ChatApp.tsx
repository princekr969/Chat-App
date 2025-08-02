import { useState } from "react";
import { Lobby, ChatRoom } from "../components";

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const ChatApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'lobby' | 'chat'>('lobby');
  const [roomName, setRoomName] = useState('');
  const [user, setUser] = useState<string>('');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'Alice',
      content: 'Hey everyone! Welcome to the room!',
      timestamp: new Date(Date.now() - 300000),
      isOwn: false
    },
    {
      id: '2',
      username: 'Bob',
      content: 'Thanks! Excited to chat with you all.',
      timestamp: new Date(Date.now() - 240000),
      isOwn: false
    },
    {
      id: '3',
      username: 'You',
      content: 'Hello! Great to be here.',
      timestamp: new Date(Date.now() - 180000),
      isOwn: true
    }
  ]);

  const handleCreateRoom = (newRoomName: string) => {
    setRoomName(newRoomName);
    setCurrentView('chat');
  };

  const handleJoinRoom = (newRoomName: string) => {
    setRoomName(newRoomName);
    setCurrentView('chat');
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username: 'You',
      content,
      timestamp: new Date(),
      isOwn: true
    };
    setMessages([...messages, newMessage]);
  };

  if (currentView === 'lobby') {
    return (
      <Lobby
        user={user}
        onUserChange={setUser}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  return (
    <ChatRoom
      roomName={roomName}
      messages={messages}
      onBackToLobby={handleBackToLobby}
      onSendMessage={handleSendMessage}
    />
  );
};

export default ChatApp;