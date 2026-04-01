import React from 'react';
import './styles.css';
import Whiteboard from './components/canvas/white_board';
import ChatBox from './components/ChatBox';
import VoiceBox from './components/VoiceBox';

function App() {
  return (
    <div className="relative w-screen h-screen bg-gray-50">
      {/* Whiteboard làm nền phía dưới */}
      <Whiteboard />

      {/* Chat + Voice box component tự xử lý vị trí và nút toggle */}
      <ChatBox />
      <VoiceBox />
    </div>
  );
}

export default App;