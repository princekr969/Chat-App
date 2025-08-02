import React from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;