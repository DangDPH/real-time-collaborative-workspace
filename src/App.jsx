import React from "react";
import Whiteboard from "./components/canvas/white_board";
import ChatBox from "./components/ChatBox";
import VoiceBox from "./components/VoiceBox";

function App() {
  return (
    <div className="relative w-screen h-screen bg-gray-50">
      {/* Whiteboard nền */}
      <Whiteboard />

      {/* Chat Box (overlay) */}
      <div className="absolute bottom-4 right-4">
        <ChatBox />
      </div>

      {/* Voice Box (overlay) */}
      <div className="absolute bottom-20 right-4">
        <VoiceBox />
      </div>
    </div>
  );
}

export default App;