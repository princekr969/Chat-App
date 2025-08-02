import { useState } from "react";

const JoinRoom: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomName: string) => void;
}> = ({ isOpen, onClose, onJoinRoom }) => {
  const [roomName, setRoomName] = useState('');

  const handleJoin = () => {
    if (roomName.trim()) {
      onJoinRoom(roomName);
      setRoomName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Join Room</h2>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none mb-4"
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={!roomName.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom