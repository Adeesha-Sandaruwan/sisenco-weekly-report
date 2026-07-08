import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Sisenco AI initialized. I have analyzed the recent team reports. How can I assist you with team analytics today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      console.error('AI Core Communication Error:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'System Error: Connection to AI core failed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(91,124,250,0.45)] ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      <div className={`fixed bottom-8 right-8 z-[100] flex w-[380px] sm:w-[400px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[600px]' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_10px_30px_rgba(91,124,250,0.35)]">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-white">Sisenco AI</h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 ${msg.sender === 'user' ? 'bg-slate-900 text-slate-300' : 'bg-gradient-to-br from-[#5b7cfa]/20 to-cyan-400/20 text-cyan-400'}`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div className={`rounded-[20px] p-4 text-sm leading-relaxed ${msg.sender === 'user' ? 'rounded-tr-sm bg-gradient-to-r from-[#5b7cfa] to-[#2dd4bf] text-white shadow-lg' : 'rounded-tl-sm bg-white/5 text-slate-200 border border-white/10 shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3 flex-row">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#5b7cfa]/20 to-cyan-400/20 text-cyan-400">
                  <Sparkles size={14} />
                </div>
                <div className="rounded-[20px] rounded-tl-sm bg-white/5 p-4 border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-slate-950/50 p-4">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about team progress..."
              className="w-full rounded-[20px] border border-white/10 bg-white/5 py-3.5 pl-5 pr-12 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-[#5b7cfa] focus:bg-white/10 focus:ring-1 focus:ring-[#5b7cfa]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#5b7cfa] to-[#2dd4bf] text-white shadow-md transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}