import { ArrowLeft } from "lucide-react";

const ChatHeader: React.FC<{
  roomName: string;
  onBackToLobby: () => void;
}> = ({ roomName, onBackToLobby }) => {
  return (
    <div className="bg-white shadow-sm border-b px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg text-gray-900">#{roomName}</h1>
            <p className="text-sm text-gray-500">3 members online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Connected</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader