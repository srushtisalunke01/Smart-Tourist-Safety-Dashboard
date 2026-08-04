import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';

const ChatAssistant = () => {
  const { askAIChat, isChatExpanded, setIsChatExpanded } = useApp();
  const { t } = useLanguage();
  const isOpen = isChatExpanded;
  const setIsOpen = setIsChatExpanded;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages(prev => {
      const welcomeContent = t("chat.welcome") || '🤖 Namaste! I am **SafeTour AI**, your tourist safety and travel assistant. How can I help you travel safely today?';
      if (prev.length === 0) {
        return [{ role: 'assistant', content: welcomeContent }];
      }
      return prev.map((msg, index) => {
        if (index === 0 && msg.role === 'assistant') {
          return { ...msg, content: welcomeContent };
        }
        return msg;
      });
    });
  }, [t]);

  const handleSend = async (textToSend) => {
    const userMessage = textToSend || input;
    if (!userMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await askAIChat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Apologies, I could not complete the request. Check your connectivity.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggest = (text) => {
    handleSend(text);
  };

  // Helper to parse simple markdown bold and bullet points into HTML elements
  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Parse list items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const parsedText = parseBoldText(trimmed.substring(2));
        return <li key={idx} className="ml-4 list-disc text-xs my-1 text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: parsedText }} />;
      }
      
      // Parse warnings or alerts
      if (trimmed.startsWith('⚠️') || trimmed.startsWith('🚨')) {
        const parsedText = parseBoldText(trimmed);
        return <p key={idx} className="text-xs font-semibold my-2 text-red-650 dark:text-red-400 flex items-start gap-1.5" dangerouslySetInnerHTML={{ __html: parsedText }} />;
      }

      // Normal paragraph
      const parsedText = parseBoldText(line);
      return <p key={idx} className="text-xs leading-relaxed my-1.5 text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: parsedText }} />;
    });
  };

  const parseBoldText = (text) => {
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-brand-500 text-slate-800 dark:text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group flex items-center justify-center glow-purple"
        >
          <MessageSquare className="w-5 h-5 text-brand-500 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Chat Sidebar Drawer */}
      {isOpen && (
        <div className="fixed top-0 right-0 z-[99999] h-full w-full max-w-md bg-white/95 dark:bg-slate-950/95 border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col animate-slideLeft pointer-events-auto">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {t("navbar.chatAssistant") || "SafeTour AI Assistant"}
                </h4>
                <span className="text-[10px] text-brand-500 dark:text-brand-400 font-semibold">{t("chat.offlineFallback") || "Offline fallbacks active"}</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Queue */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl border ${
                  msg.role === 'user' 
                  ? 'bg-brand-900/10 dark:bg-brand-900/30 border-brand-500/30 text-slate-900 dark:text-white rounded-br-none' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-md'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-none text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Panel */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-brand-500" />
                {t("chat.suggestions") || "Frequently Queried Safety Procedures"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleSuggest('What to do in an Emergency / SOS?')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-semibold transition-all">🚨 Emergency SOS</button>
                <button onClick={() => handleSuggest('What are some common tourist scams?')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-semibold transition-all">💸 Tourist Scams</button>
                <button onClick={() => handleSuggest('Is Goa beach safe at night?')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-semibold transition-all">🌴 Goa Safety</button>
                <button onClick={() => handleSuggest('How does Women Safety Mode work?')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-semibold transition-all">👩 Women Safety</button>
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder") || "Ask travel security questions..."}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-brand-600 flex items-center justify-center shadow-lg hover:shadow-brand-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatAssistant;
