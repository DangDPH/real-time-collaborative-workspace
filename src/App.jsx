import { useState } from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";
import TextEditor from "./components/TextEditor";
import ChatPanel from "./components/ChatPanel";
import Resizer from "./components/Resizer";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [mode, setMode] = useState("split");
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newSplit = (e.clientX / window.innerWidth) * 100;
    setSplit(Math.min(80, Math.max(20, newSplit))); // giới hạn 20%-80%
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="bg-red-500 h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 🔝 Toolbar */}
      <Toolbar setMode={setMode} />

      {/* 🔻 Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* 🎨 Sidebar */}
        <Sidebar />

        {/* 🧠 Workspace */}
        <div className="flex flex-1 m-2 rounded-xl overflow-hidden bg-white shadow">

          {/* Canvas */}
          {mode !== "text" && (
            <div
              className="border-r"
              style={{ width: mode === "split" ? `${split}%` : "100%" }}
            >
              <Canvas />
            </div>
          )}

          {/* Resizer */}
          {mode === "split" && (
            <Resizer onMouseDown={() => setDragging(true)} />
          )}

          {/* Text */}
          {mode !== "canvas" && (
            <div className="flex-1">
              <TextEditor />
            </div>
          )}

        </div>

        {/* 💬 Chat */}
        <ChatPanel />

      </div>
    </div>
  );
}