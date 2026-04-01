import React from 'react';
import Whiteboard from './components/canvas/white_board';
import ChatBox from './components/ChatBox';
import VoiceBox from './components/VoiceBox';

function App() {
  return (
    <div className="relative w-screen h-screen bg-gray-50">
      {/* Whiteboard làm nền phía dưới */}
      <Whiteboard />

      {/* Chat Box nổi phía trên góc phải dưới */}
      <div className="absolute bottom-4 right-4" style={{ zIndex: 1000 }}>
        <ChatBox />
      </div>

      {/* Voice Box nổi phía trên Chat Box */}
      <div className="absolute bottom-20 right-4" style={{ zIndex: 1000 }}>
        <VoiceBox />
      </div>
    </div>
  );
}

export default App;