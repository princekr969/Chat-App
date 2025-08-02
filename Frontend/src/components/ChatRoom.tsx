import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface payloadType{
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}
interface Message {
  type: string
  payload: payloadType
}

const ChatRoom: React.FC<{
  roomName: string;
  isConnected: boolean;
  connectionError:string;
  messages: Message[];
  onBackToLobby: () => void;
  onSendMessage: (content: string) => void;
}> = ({ roomName, messages, onBackToLobby, onSendMessage, isConnected, connectionError }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ChatHeader roomName={roomName} onBackToLobby={onBackToLobby} />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatRoom