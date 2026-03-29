import { useState } from "react";

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", sender: "other" },
    { id: 2, text: "Hi 👋", sender: "me" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: "me" }]);
    setInput("");
  };

  return (
    <div className="w-80 h-full flex flex-col justify-end p-4 bg-[#f7f7f7]">

      {/* Messages */}
      <div className="flex flex-col gap-2 mb-3 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                px-4 py-2 rounded-full shadow text-sm max-w-[70%]
                ${
                  msg.sender === "me"
                    ? "bg-[#4cc9f0] text-white"
                    : "bg-[#1d3557] text-white"
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 px-4 py-2 rounded-full bg-[#fefae0] outline-none"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-full bg-[#ffafcc] text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}