import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const ChatModal = ({ isOpen, onClose, conversationId, type, serviceId, bookingId, contextInfo }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const inputRef = useRef(null);

  // Quick reply options based on role and context
  const quickReplies = user?.role === 'provider' ? [
    { text: 'Available tomorrow', icon: '📅' },
    { text: 'Please share your address', icon: '📍' },
    { text: 'I can do this service', icon: '✅' },
    { text: 'What time works for you?', icon: '⏰' },
    { text: 'Price will be ₹', icon: '💰' },
  ] : [
    { text: 'What is your availability?', icon: '📅' },
    { text: 'How much would this cost?', icon: '💰' },
    { text: 'Do you cover my area?', icon: '📍' },
    { text: 'Can you come today?', icon: '⏰' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      if (conversationId) {
        fetchConversation();
      } else {
        createOrGetConversation();
      }

      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        if (conversationId || conversation?._id) {
          fetchMessages(conversationId || conversation?._id);
        }
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isConversationLocked()) {
      inputRef.current.focus();
    }
  }, [isOpen, conversation]);

  const createOrGetConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        getApiUrl('api/chat/conversations'),
        {
          type,
          ...(type === 'INQUIRY' ? { serviceId } : { bookingId }),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setConversation(response.data.conversation);
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert(error.response?.data?.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        getApiUrl(`api/chat/conversations/${conversationId}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setConversation(response.data.conversation);
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert(error.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const response = await axios.get(
        getApiUrl(`api/chat/conversations/${convId}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages || []);
        if (response.data.conversation) {
          setConversation(response.data.conversation);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || isConversationLocked()) return;

    const currentConvId = conversationId || conversation?._id;
    if (!currentConvId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await axios.post(
        getApiUrl(`api/chat/conversations/${currentConvId}/messages`),
        { text: messageText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        if (conversation) {
          setConversation((prev) => ({
            ...prev,
            lastMessageAt: new Date(),
          }));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (text) => {
    setNewMessage(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const isConversationLocked = () => {
    if (!conversation) return false;
    
    // Check if conversation is closed/archived
    if (conversation.status === 'closed' || conversation.status === 'archived') {
      return true;
    }
    
    // Check booking status if it's a booking chat
    if (type === 'BOOKING' && conversation.bookingId) {
      const bookingStatus = conversation.bookingId.status;
      if (['rejected', 'cancelled', 'completed'].includes(bookingStatus)) {
        return true;
      }
    }
    
    return false;
  };

  const getLockedMessage = () => {
    if (conversation?.status === 'closed') {
      return 'This conversation has been closed';
    }
    if (conversation?.status === 'archived') {
      return 'This conversation is archived';
    }
    if (type === 'BOOKING' && conversation?.bookingId) {
      const status = conversation.bookingId.status;
      if (status === 'rejected') return 'Booking was rejected';
      if (status === 'cancelled') return 'Booking was cancelled';
      if (status === 'completed') return 'Service completed';
    }
    return 'This conversation is no longer active';
  };

  if (!isOpen) return null;

  const getOtherPartyName = () => {
    if (!conversation) return 'Provider';
    if (user.role === 'customer') {
      return conversation.providerId?.businessName || 'Provider';
    }
    return conversation.clientId?.name || 'Customer';
  };

  const getPlaceholderText = () => {
    if (type === 'INQUIRY') {
      return 'Discuss about service details, pricing, availability...';
    }
    return 'Discuss booking details, timing, location...';
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'accepted': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'rejected': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  // System messages renderer
  const renderSystemMessage = (text, icon) => (
    <div className="flex justify-center my-4">
      <div className="px-4 py-2 bg-slate-100 dark:bg-neutral-800 rounded-full text-xs font-medium text-slate-500 dark:text-neutral-400 flex items-center gap-2">
        <span>{icon}</span>
        <span>{text}</span>
      </div>
    </div>
  );

  // Generate system messages based on conversation/booking state
  const getSystemMessages = () => {
    const systemMsgs = [];
    
    // Add inquiry started message
    if (type === 'INQUIRY' && messages.length === 0) {
      return null; // Will show empty state instead
    }
    
    return systemMsgs;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = formatDate(msg.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);
  const locked = isConversationLocked();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
        {/* Enhanced Header */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-gradient-to-r from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Context Badge */}
              <div className="flex items-center gap-2 mb-2">
                {type === 'INQUIRY' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Inquiry
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getBookingStatusColor(conversation?.bookingId?.status)}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Booking {conversation?.bookingId?.status && `• ${conversation.bookingId.status.charAt(0).toUpperCase() + conversation.bookingId.status.slice(1)}`}
                  </span>
                )}
              </div>
              
              {/* Service Title */}
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {contextInfo?.serviceTitle || contextInfo?.bookingTitle || 'Chat'}
              </h2>
              
              {/* Context Details */}
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {getOtherPartyName().charAt(0).toUpperCase()}
                  </div>
                  {getOtherPartyName()}
                </span>
                {type === 'BOOKING' && conversation?.bookingId?.bookingDate && (
                  <span className="flex items-center gap-1 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(conversation.bookingId.bookingDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-neutral-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-neutral-700 border-t-blue-500 animate-spin"></div>
              <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Start the conversation</h3>
              <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-xs">
                {type === 'INQUIRY' 
                  ? 'Ask the provider about availability, pricing, or service details.' 
                  : 'Discuss booking details, timing, and any special requirements.'}
              </p>
              
              {/* Starter suggestions */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {quickReplies.slice(0, 3).map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply.text)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    {reply.icon} {reply.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Conversation Started System Message */}
              {renderSystemMessage(
                type === 'INQUIRY' ? 'Inquiry started' : 'Booking conversation started',
                type === 'INQUIRY' ? '💬' : '📋'
              )}
              
              {/* Messages grouped by date */}
              {Object.entries(messageGroups).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-white dark:bg-neutral-800 rounded-full text-xs font-medium text-slate-400 dark:text-neutral-500 shadow-sm border border-slate-200 dark:border-neutral-700">
                      {date}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  {msgs.map((message, idx) => {
                    const isOwnMessage = message.senderId?._id === user._id;
                    const showAvatar = idx === 0 || msgs[idx - 1]?.senderId?._id !== message.senderId?._id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}
                      >
                        {/* Avatar space for other party */}
                        {!isOwnMessage && (
                          <div className="w-8 mr-2 flex-shrink-0">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center text-slate-600 dark:text-neutral-300 text-xs font-bold">
                                {(message.senderId?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                                : 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 border border-slate-200 dark:border-neutral-700 rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          </div>
                          
                          {/* Message meta */}
                          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] ${isOwnMessage ? 'text-slate-400 dark:text-neutral-500' : 'text-slate-400 dark:text-neutral-500'}`}>
                              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            
                            {/* Message status for own messages */}
                            {isOwnMessage && (
                              <span className="flex items-center">
                                {message.read ? (
                                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 7l-8.5 8.5-4-4M22 7l-8.5 8.5-1-1" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Avatar space for own messages (for alignment) */}
                        {isOwnMessage && <div className="w-8 ml-2 flex-shrink-0"></div>}
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mb-1">
                  <div className="w-8 mr-2"></div>
                  <div className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {locked ? (
          /* Locked State */
          <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-900">
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500 dark:text-neutral-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{getLockedMessage()}</span>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {/* Quick Replies */}
            {showQuickReplies && (
              <div className="p-3 border-b border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply.text)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-full hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all"
                    >
                      {reply.icon} {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-4">
              <div className="flex items-end gap-2">
                {/* Quick Reply Toggle */}
                <button
                  type="button"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`p-2.5 rounded-xl transition-all ${
                    showQuickReplies 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                      : 'text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Quick replies"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                
                {/* Input Field */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={getPlaceholderText()}
                    className="w-full px-4 py-3 pr-10 text-sm border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 dark:bg-neutral-800 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 transition-all"
                    disabled={sending || loading || !conversation}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-neutral-600">
                    ⏎
                  </span>
                </div>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending || loading || !conversation}
                  className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
                >
                  {sending ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
