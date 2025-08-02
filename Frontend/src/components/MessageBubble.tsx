interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.isOwn
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-900 shadow-sm'
        }`}
      >
        {!message.isOwn && (
          <p className="text-xs font-semibold text-indigo-600 mb-1">
            {message.username}
          </p>
        )}
        <p className="text-sm">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.isOwn ? 'text-indigo-200' : 'text-gray-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;