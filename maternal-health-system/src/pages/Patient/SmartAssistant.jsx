import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";

const SmartAssistant = () => {
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarVisible &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".menu-btn")
      ) {
        setIsSidebarVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarVisible]);

  const sendMessage = async () => {
    if (!message) return;

    const userMsg = { role: "user", content: message };
    const updatedChat = [...chatLog, userMsg];
    setChatLog(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "No response";

      setChatLog([...updatedChat, { role: "assistant", content: reply }]);
    } catch (err) {
      setChatLog([
        ...updatedChat,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="p-4 max-w-2xl mx-auto bg-white rounded shadow mt-6">
          <h2 className="text-xl font-bold mb-4">
            🤖 Maternal Health Assistant
          </h2>

          <div className="h-64 overflow-y-auto border p-3 rounded bg-gray-50 mb-3">
            {chatLog.map((entry, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  entry.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded ${
                    entry.role === "user" ? "bg-blue-200" : "bg-green-100"
                  }`}
                >
                  <strong>{entry.role === "user" ? "You" : "AI"}:</strong>{" "}
                  {entry.content}
                </div>
              </div>
            ))}
            {loading && <p className="text-gray-500">Thinking...</p>}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="Ask a question about pregnancy, danger signs..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;
