import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export const EstateAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Modernization Architect. Ask me anything about your estate schemas, CDC pipelines, PII policy tags, or FinOps compaction ROI.',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: 'assistant', text: 'Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <span>Natural-Language Estate Assistant</span>
        </h2>
        <p className="text-xs text-gray-400">
          Query estate topology, PII compliance, and CDC replication status grounded in platform metadata.
        </p>
      </div>

      <div className="glass-panel p-5 rounded-xl border border-google-border h-[480px] flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-3.5 pr-2 flex-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 text-xs ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-blue-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-xl max-w-xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/40 text-gray-100'
                    : 'bg-google-dark border border-google-border text-gray-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono pl-10">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Gemini 2.5 is reasoning over estate graph...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2.5 pt-3 border-t border-google-border mt-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g. Which tables contain PII? Or why did transactions get CDC?"
            className="flex-1 bg-google-dark border border-google-border rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
