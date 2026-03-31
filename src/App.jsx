import React from "react";
import ChatBox from "./components/ChatBox";
import VoiceBox from "./components/VoiceBox";

function App() {
  return (
    <div className="relative w-screen h-screen bg-gray-50">
      {/* Chat Box */}
      <ChatBox />

      {/* Voice Box */}
      <VoiceBox />
    </div>
  );
}

export default App;