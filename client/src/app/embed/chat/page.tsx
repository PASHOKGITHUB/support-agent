'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface Citation {
  documentId: string;
  filename: string;
  snippet: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  createdAt: string;
}

function EmbedChatContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [companyName, setCompanyName] = useState('Support Assistant');
  const [supportConfig, setSupportConfig] = useState<any>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, sending]);

  // Load support configuration and initialize guest session
  useEffect(() => {
    if (!companyId) {
      setError('Missing Company Workspace Identifier.');
      setLoading(false);
      return;
    }

    const initPublicChat = async () => {
      try {
        // 1. Fetch company config
        const configRes = await fetch(`${API_URL}/public/support?companyId=${companyId}&_t=${Date.now()}`);
        if (!configRes.ok) {
          if (configRes.status === 404) {
            throw new Error('Workspace / Company not found. Please verify your Company ID.');
          }
          if (configRes.status === 400) {
            throw new Error('Invalid Company Workspace format.');
          }
          throw new Error('Failed to retrieve support configuration.');
        }
        const configData = await configRes.json();
        setSupportConfig(configData);
        setCompanyName(configData.companyName || 'Support Assistant');

        // 2. Initialize chat session
        const sessionKey = `guest_chat_${companyId}`;
        let sessionId = sessionStorage.getItem(sessionKey);

        if (sessionId) {
          // Check if session is valid by fetching message log
          const chatRes = await fetch(`${API_URL}/public/chats/${sessionId}`);
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            setChatSessionId(sessionId);
            setMessages(chatData.messages || []);
          } else {
            // Expired or deleted session, generate new one
            sessionId = null;
          }
        }

        if (!sessionId) {
          const createRes = await fetch(`${API_URL}/public/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId })
          });
          if (!createRes.ok) {
            throw new Error('Could not create chat session.');
          }
          const createData = await createRes.json();
          sessionStorage.setItem(sessionKey, createData._id);
          setChatSessionId(createData._id);
          setMessages([]);
        }

      } catch (err) {
        console.error(err);
        setError((err as Error).message || 'Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initPublicChat();
  }, [companyId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatSessionId || sending) return;

    const userQuery = inputText.trim();
    setInputText('');
    setSending(true);
    setError('');

    // Add user message locally
    const tempUserMsg: Message = {
      sender: 'user',
      text: userQuery,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch(`${API_URL}/public/chats/${chatSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userQuery })
      });

      if (!response.ok) {
        throw new Error('Server error initiating answer stream.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamAccumulator = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value);
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  streamAccumulator += parsed.chunk;
                  setStreamingText(streamAccumulator);
                } else if (parsed.error) {
                  setError(parsed.error);
                }
              } catch (err) {
                // Ignore incomplete lines
              }
            }
          }
        }
      }

      // Fetch official log
      const logRes = await fetch(`${API_URL}/public/chats/${chatSessionId}`);
      if (logRes.ok) {
        const logData = await logRes.json();
        setMessages(logData.messages || []);
      }

    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Failed to stream response.');
    } finally {
      setStreamingText('');
      setSending(false);
      setFeedbackSaved(null);
    }
  };

  const handleFeedback = async (rating: 'helpful' | 'not_helpful') => {
    if (!chatSessionId) return;

    try {
      const res = await fetch(`${API_URL}/public/chats/${chatSessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: rating })
      });

      if (res.ok) {
        setFeedbackSaved(rating);
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen h-[100dvh] w-full bg-slate-950 text-slate-100 items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full bg-slate-50 text-slate-800 overflow-hidden font-sans border-0">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-650 to-purple-650 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          {supportConfig?.logo ? (
            <div className="relative shrink-0">
              <img src={supportConfig.logo} alt={`${companyName} Logo`} className="w-8 h-8 rounded-xl object-contain p-0.5 bg-white border border-white/10" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-450 border border-indigo-650 animate-pulse" />
            </div>
          ) : (
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center font-bold text-sm">
                {companyName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-450 border border-indigo-650 animate-pulse" />
            </div>
          )}
          <div>
            <h1 className="text-sm sm:text-xs font-bold truncate max-w-[200px]">{companyName} Support</h1>
            <p className="text-[10px] sm:text-[9px] text-indigo-150">AI Customer Agent</p>
          </div>
        </div>
        {supportConfig?.supportEmail && (
          <span className="text-[10px] sm:text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-medium">
            Online
          </span>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-80">
            {supportConfig?.logo ? (
              <img src={supportConfig.logo} alt={`${companyName} Logo`} className="w-14 h-14 rounded-2xl object-contain p-1 bg-white shadow-md border border-slate-200 mb-3" />
            ) : (
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            )}
            <h2 className="text-sm sm:text-xs font-bold text-slate-700">Hi there! 👋</h2>
            <p className="text-slate-550 text-xs sm:text-[10px] max-w-[240px] mt-1 leading-normal">
              Ask me anything about our services. I search our official documentation to assist you.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={index} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 mt-1 flex items-center justify-center">
                  {supportConfig?.logo ? (
                    <img src={supportConfig.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-full h-full flex items-center justify-center">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm sm:text-xs leading-relaxed ${isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {streamingText && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 mt-1 flex items-center justify-center">
              {supportConfig?.logo ? (
                <img src={supportConfig.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-full h-full flex items-center justify-center">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-800 text-sm sm:text-xs leading-relaxed shadow-sm">
              <p className="whitespace-pre-wrap">{streamingText}</p>
              <span className="inline-block h-3.5 w-1 bg-indigo-600 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {sending && !streamingText && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 mt-1 flex items-center justify-center">
              {supportConfig?.logo ? (
                <img src={supportConfig.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-full h-full flex items-center justify-center">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 py-2.5 px-3.5 rounded-xl rounded-tl-none w-16 justify-center shadow-sm">
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs sm:text-[10px] leading-normal flex items-start gap-1">
            <span className="shrink-0 font-bold mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Helpful rating (Thumbs feedback) - Only show if chat has messages and not loading */}
      {messages.length > 0 && !sending && !streamingText && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-250 flex items-center justify-between text-xs sm:text-[10px] shrink-0 text-slate-500">
          <span>Was this helpful?</span>
          <div className="flex gap-3">
            <button
              onClick={() => handleFeedback('helpful')}
              disabled={feedbackSaved !== null}
              className={`hover:text-indigo-600 transition-colors cursor-pointer ${feedbackSaved === 'helpful' ? 'text-indigo-600 font-bold' : ''}`}
            >
              👍 Yes
            </button>
            <button
              onClick={() => handleFeedback('not_helpful')}
              disabled={feedbackSaved !== null}
              className={`hover:text-indigo-600 transition-colors cursor-pointer ${feedbackSaved === 'not_helpful' ? 'text-red-500 font-bold' : ''}`}
            >
              👎 No
            </button>
          </div>
        </div>
      )}

      {/* Chat Input form */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-650 transition-colors text-base sm:text-xs font-medium"
            disabled={sending || !chatSessionId}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim() || !chatSessionId}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EmbedChatPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen h-[100dvh] w-full bg-slate-950 text-slate-100 items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <EmbedChatContent />
    </React.Suspense>
  );
}
