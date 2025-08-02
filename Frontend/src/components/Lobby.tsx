import { useState } from "react";
import { Users ,MessageCircle } from "lucide-react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

const Lobby: React.FC<{
  user: string;
  isConnecting: boolean;
  connectionError:string;
  onUserChange: (user: string) => void;
  onCreateRoom: (roomName: string) => void;
  onJoinRoom: (roomName: string) => void;
}> = ({ user, onUserChange, onCreateRoom, onJoinRoom, isConnecting, connectionError }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleCreateRoom = (roomName: string) => {
    onCreateRoom(roomName);
    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomName: string) => {
    onJoinRoom(roomName);
    setShowJoinModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat App</h1>
          <p className="text-gray-600">Connect and chat with friends in real-time</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Username
          </label>
          <input
            type="text"
            value={user}
            onChange={(e) => onUserChange(e.target.value )}
            placeholder="Enter your username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!user.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Room
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            disabled={!user.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Join Room
          </button>
        </div>
      </div>

      <CreateRoom
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />

      <JoinRoom
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
};

export default Lobby;