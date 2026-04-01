import { useEffect, useState } from "react";
import "./styles.css";
import Whiteboard from "./components/canvas/white_board";
import DocumentEditor from "./DocumentEditor";
import ChatBox from "./components/ChatBox";
import VoiceBox from "./components/VoiceBox";

function App() {
  const [mode, setMode] = useState(
    localStorage.getItem("workspace-mode") || "split"
  );
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem("workspace-left-width");
    return saved ? Number(saved) : window.innerWidth * 0.72;
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("workspace-mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("workspace-left-width", String(leftWidth));
  }, [leftWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || mode !== "split") return;

      const minLeft = 360;
      const minRight = 320;
      const maxLeft = window.innerWidth - minRight;

      const newLeftWidth = Math.min(Math.max(e.clientX, minLeft), maxLeft);
      setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, mode]);

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.logo}>Realtime Collaborative Workspace</div>

        <div style={styles.actions}>
          <div style={styles.modeGroup}>
            <button
              style={mode === "canvas" ? styles.activeButton : styles.button}
              onClick={() => setMode("canvas")}
            >
              Canvas
            </button>

            <button
              style={mode === "document" ? styles.activeButton : styles.button}
              onClick={() => setMode("document")}
            >
              Document
            </button>

            <button
              style={mode === "split" ? styles.activeButton : styles.button}
              onClick={() => setMode("split")}
            >
              Split
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {mode === "canvas" && (
          <div style={styles.fullPane}>
            <Whiteboard />
          </div>
        )}

        {mode === "document" && (
          <div style={styles.fullPane}>
            <DocumentEditor />
          </div>
        )}

        {mode === "split" && (
          <div style={styles.layout}>
            <div style={{ ...styles.leftPane, width: leftWidth }}>
              <Whiteboard />
            </div>

            <div
              style={styles.divider}
              onMouseDown={() => setIsDragging(true)}
              title="Drag to resize"
            />

            <div style={styles.rightPane}>
              <DocumentEditor />
            </div>
          </div>
        )}
      </div>

      {/* Chat + Voice box floating overlay */}
      <ChatBox />
      <VoiceBox />
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#e2e8f0",
  },

  topbar: {
    height: 56,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    background: "#ffffff",
    borderBottom: "1px solid #dbe3ec",
  },

  logo: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  modeGroup: {
    display: "flex",
    gap: 8,
  },

  button: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #dbe3ec",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 500,
  },

  activeButton: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #4da6ff",
    background: "#eaf4ff",
    color: "#0f62fe",
    cursor: "pointer",
    fontWeight: 600,
  },

  primaryButton: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #0f62fe",
    background: "#0f62fe",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  content: {
    flex: 1,
    minHeight: 0,
  },

  fullPane: {
    width: "100%",
    height: "100%",
  },

  layout: {
    width: "100%",
    height: "100%",
    display: "flex",
    overflow: "hidden",
    background: "#e2e8f0",
  },

  leftPane: {
    minWidth: 0,
    height: "100%",
    flexShrink: 0,
  },

  divider: {
    width: "10px",
    cursor: "col-resize",
    background: "linear-gradient(to right, #e2e8f0, #cbd5e1, #e2e8f0)",
    flexShrink: 0,
  },

  rightPane: {
    flex: 1,
    minWidth: 320,
    height: "100%",
    background: "#fff",
  },
};

export default App;