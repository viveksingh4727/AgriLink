import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";

const farmerChips = [
  "Best crops for monsoon?",
  "How to set crop prices?",
  "Tips to prevent crop disease",
  "How to use AgriLink listings?",
];

const buyerChips = [
  "How to find fresh tomatoes?",
  "How to place an order?",
  "Difference between organic & regular?",
  "Best buying season for onions?",
];

const guestChips = [
  "What is AgriLink?",
  "How to register as a farmer?",
  "Best crops for this season?",
  "How to buy crops online?",
];

const ChatAssistant = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: user
        ? `Hello ${user.name.split(" ")[0]}! 👋 I'm your AgriLink AI assistant powered by Llama 3.3. Ask me anything about crops, prices, farming tips, or how to use the platform!`
        : "Hello! 👋 I'm AgriLink AI — your smart agriculture assistant. Ask me about crops, market prices, or farming tips!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Reset greeting when user logs in/out
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: user
          ? `Hello ${user.name.split(" ")[0]}! 👋 I'm your AgriLink AI assistant powered by Llama 3.3. Ask me anything about crops, prices, farming tips, or how to use the platform!`
          : "Hello! 👋 I'm AgriLink AI — your smart agriculture assistant. Ask me about crops, market prices, or farming tips!",
      },
    ]);
  }, [user?._id]);

  const handleSend = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    const userMsg = { role: "user", content: message };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only role+content to the API (strip display-only fields)
      const payload = nextMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const { data } = await api.post("/ai/chat", {
        messages: payload,
        userRole: user?.role || "guest",
      });

      setMessages([...nextMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Unable to reach the AI assistant. Please try again.";
      showToast(errMsg, "error");
      // Show error inline in chat too
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "⚠️ Sorry, I couldn't process that right now. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chips =
    user?.role === "farmer"
      ? farmerChips
      : user?.role === "buyer"
      ? buyerChips
      : guestChips;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 flex h-[36rem] w-[23rem] flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-xl">
                🤖
              </div>
              <div>
                <p className="font-bold text-white text-sm">AgriLink AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-[10px] text-brand-100 font-medium">Llama 3.3 · Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMessages([{
                    role: "assistant",
                    content: user
                      ? `Hello ${user.name.split(" ")[0]}! 👋 Chat cleared. What would you like to know?`
                      : "Chat cleared! How can I help you?",
                  }]);
                }}
                title="Clear chat"
                className="text-white/60 hover:text-white text-xs transition-colors px-1"
              >
                🗑️
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg transition-colors">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-surface-50 scroll-smooth">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed animate-slide-up whitespace-pre-wrap ${
                  m.role === "assistant"
                    ? "bg-white border border-surface-200 text-surface-800 shadow-sm"
                    : "ml-auto bg-gradient-to-r from-brand to-brand-400 text-white shadow-sm"
                }`}
              >
                {m.content}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="bg-white border border-surface-200 rounded-2xl px-4 py-3 shadow-sm w-fit">
                <div className="flex gap-1.5 items-center">
                  <span className="text-xs text-surface-400 mr-1">Thinking</span>
                  <span className="h-2 w-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips — shown only when chat is fresh */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border-t border-surface-100 bg-white shrink-0">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="border-t border-surface-200 p-3 bg-white shrink-0"
          >
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about farming..."
                rows={1}
                className="input-field !rounded-2xl !py-2.5 !text-sm flex-1 resize-none"
                style={{ maxHeight: "80px" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary !rounded-xl !px-4 !py-2.5 shrink-0 disabled:opacity-50"
              >
                ↑
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-surface-300">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        type="button"
        onClick={() => setOpen((c) => !c)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-700 to-brand text-2xl text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-110 pulse-glow"
        title="Open AI Assistant"
      >
        {open ? "✕" : "🤖"}
      </button>
    </div>
  );
};

export default ChatAssistant;
