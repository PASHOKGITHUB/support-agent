'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';

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

interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
}

function ChatContent() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  // Toggles for displaying citations details
  const [activeCitation, setActiveCitation] = useState<{ msgIndex: number; citIndex: number } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load chat sessions on mount
  const fetchSessions = async (selectId?: string) => {
    try {
      setLoadingSessions(true);
      const data = await api.get('/chats');
      setSessions(data);
      
      // Determine initial active session
      const queryId = searchParams.get('id');
      const targetId = selectId || queryId || (data.length > 0 ? data[0]._id : null);
      
      if (targetId) {
        setActiveSessionId(targetId);
        loadSessionMessages(targetId);
        if (!queryId) {
          router.push(`/chat?id=${targetId}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load chat history.');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch the chat sessions list once on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Update active session and load messages when URL changes, without refetching sessions list
  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId && queryId !== activeSessionId) {
      setActiveSessionId(queryId);
      loadSessionMessages(queryId);
    }
  }, [searchParams]);

  // Load specific session messages
  const loadSessionMessages = async (id: string) => {
    try {
      setLoadingHistory(true);
      setError('');
      const data = await api.get(`/chats/${id}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch conversation logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Create new chat session
  const handleNewChat = async () => {
    // 1. If currently active chat is already empty, do nothing
    if (activeSessionId && messages.length === 0) {
      return;
    }

    // 2. Check if there is an existing empty chat in the list, and switch to it
    const existingEmpty = (sessions as any[]).find(s => !s.messages || s.messages.length === 0);
    if (existingEmpty) {
      setActiveSessionId(existingEmpty._id);
      setMessages([]);
      router.push(`/chat?id=${existingEmpty._id}`);
      return;
    }

    try {
      setError('');
      const newChat = await api.post('/chats', {});
      setSessions(prev => [newChat, ...prev]);
      setActiveSessionId(newChat._id);
      setMessages([]);
      router.push(`/chat?id=${newChat._id}`);
    } catch (err) {
      setError('Could not create new session.');
    }
  };

  // Delete chat session
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setError('');
      await api.delete(`/chats/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
        router.push('/chat');
      }
    } catch (err) {
      setError('Could not delete session.');
    }
  };

  // Submit message & handle streaming
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId || sending) return;

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
      const token = localStorage.getItem('token');
      const streamUrl = api.getStreamUrl(`/chats/${activeSessionId}/messages`);
      
      // Fetch utilizing stream
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: userQuery })
      });

      if (!response.ok) {
        throw new Error('Server returned error initiating stream.');
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
                // Ignore parsing errors for incomplete lines
              }
            }
          }
        }
      }

      // Once streaming finishes, reload active session from server to get clean DB record (and references)
      await loadSessionMessages(activeSessionId);
      // Refresh titles (in case it renamed the session)
      const data = await api.get('/chats');
      setSessions(data);

    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Failed to generate message streaming.');
    } finally {
      setStreamingText('');
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <Sidebar />

      {/* Chat Sessions History Panel */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">Conversations</h2>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            title="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loadingSessions ? (
            <div className="py-12 flex justify-center">
              <svg className="animate-spin h-5 w-5 text-indigo-550" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No conversations. Click "+" to start.
            </div>
          ) : (
            sessions.map((s) => {
              const isSelected = activeSessionId === s._id;
              return (
                <div
                  key={s._id}
                  onClick={() => {
                    setActiveSessionId(s._id);
                    loadSessionMessages(s._id);
                    router.push(`/chat?id=${s._id}`);
                  }}
                  className={`group flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer text-xs transition-all duration-300 ${isSelected ? 'bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <span className="truncate pr-4 select-none">{s.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(s._id, e)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 text-slate-500 hover:text-red-600 transition cursor-pointer"
                    title="Delete Chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-slate-50/50 relative">
        {/* Active Chat Info Header */}
        <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {sessions.find(s => s._id === activeSessionId)?.title || 'AI Support Assistant'}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Strict Response RAG Engine
            </p>
          </div>
        </div>

        {/* Error Bar */}
        {error && (
          <div className="absolute top-16 left-4 right-4 z-20 p-3 bg-red-50 border border-red-200 rounded-xl text-red-650 text-xs flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-slate-500 hover:text-slate-800 text-sm cursor-pointer">×</button>
          </div>
        )}

        {/* Chat Logs Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="p-4 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Interactive Support Chat</h3>
              <p className="text-slate-500 text-xs">
                Select a conversation history or start a new message thread.
              </p>
              <button
                onClick={handleNewChat}
                className="mt-6 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Create New Chat
              </button>
            </div>
          ) : loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <>
              {messages.length === 0 && !streamingText && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
                  <p className="text-xs text-slate-500">
                    Ask a question! The AI will query the knowledge base and reply.
                  </p>
                </div>
              )}

              {/* Message Bubbles */}
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-600/10'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Message Text */}
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Display Citations Pills if present */}
                      {!isUser && msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-500 font-semibold mr-1">Sources:</span>
                          {msg.citations.map((citation, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => {
                                // Toggle citation view
                                if (activeCitation?.msgIndex === index && activeCitation?.citIndex === cIdx) {
                                  setActiveCitation(null);
                                } else {
                                  setActiveCitation({ msgIndex: index, citIndex: cIdx });
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-[9px] text-slate-600 transition cursor-pointer"
                            >
                              📁 {citation.filename}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Active Citation Snippet Viewer Card */}
                    {!isUser && activeCitation?.msgIndex === index && (
                      <div className="w-[75%] mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-650 shadow-sm">
                        <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-slate-200/60">
                          <span className="font-bold text-slate-800">
                            Source snippet from: {msg.citations?.[activeCitation.citIndex].filename}
                          </span>
                          <button
                            onClick={() => setActiveCitation(null)}
                            className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                        <p className="italic leading-normal">
                          "{msg.citations?.[activeCitation.citIndex].snippet}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Streaming Assistant bubble */}
              {streamingText && (
                <div className="flex flex-col items-start">
                  <div className="max-w-[75%] px-5 py-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-800 text-xs leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap">{streamingText}</p>
                    <span className="inline-block h-4 w-1.5 bg-indigo-650 animate-pulse ml-0.5" />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {sending && !streamingText && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 py-3 px-4 rounded-xl rounded-tl-none w-20 justify-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar form */}
        {activeSessionId && (
          <div className="p-4 border-t border-slate-200/80 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask support assistant a question..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-450 focus:outline-none focus:border-indigo-600 transition-colors text-xs font-semibold"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-xs shadow-md shadow-indigo-600/10"
              >
                {sending ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen bg-slate-50 text-slate-800 items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ChatContent />
    </React.Suspense>
  );
}

