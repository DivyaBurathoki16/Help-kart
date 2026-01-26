import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import ChatModal from './ChatModal';

const ChatListModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'inquiries', 'bookings'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/chat/conversations'), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const convs = response.data.conversations || [];

        // For providers, filter duplicate booking chats
        if (user.role === 'provider') {
          const bookingChats = convs.filter((c) => c.type === 'BOOKING');
          const inquiryChats = convs.filter((c) => c.type === 'INQUIRY');

          const uniqueBookingChats = bookingChats.reduce((acc, current) => {
            const existing = acc.find(
              (item) =>
                item.bookingId?._id?.toString() === current.bookingId?._id?.toString() ||
                item.bookingId?.toString() === current.bookingId?.toString()
            );
            if (!existing) {
              acc.push(current);
            } else if (
              (current.unreadCount > 0 && existing.unreadCount === 0) ||
              new Date(current.lastMessageAt || 0) > new Date(existing.lastMessageAt || 0)
            ) {
              const index = acc.indexOf(existing);
              acc[index] = current;
            }
            return acc;
          }, []);

          setConversations([...inquiryChats, ...uniqueBookingChats]);
        } else {
          setConversations(convs);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getChatTitle = (conv) => {
    if (conv.type === 'INQUIRY') {
      return conv.serviceId?.title || 'Service Inquiry';
    }
    return conv.bookingId?.service?.title || 'Booking Chat';
  };

  const getChatSubtitle = (conv) => {
    if (user.role === 'customer') {
      return conv.providerId?.businessName || 'Provider';
    }
    return conv.clientId?.name || 'Customer';
  };

  const getLastMessage = (conv) => {
    if (conv.lastMessage) {
      const text = conv.lastMessage.text || '';
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }
    return 'No messages yet';
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBookingStatusBadge = (conv) => {
    if (conv.type !== 'BOOKING' || !conv.bookingId?.status) return null;
    
    const status = conv.bookingId.status;
    const statusConfig = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
      accepted: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', label: 'Accepted' },
      completed: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Completed' },
      cancelled: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', label: 'Cancelled' },
      rejected: { bg: 'bg-slate-100 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', label: 'Rejected' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Calculate total unread
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const inquiryUnread = conversations.filter(c => c.type === 'INQUIRY').reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const bookingUnread = conversations.filter(c => c.type === 'BOOKING').reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Filter conversations
  const filteredConversations = conversations
    .filter(conv => {
      // Type filter
      if (filter === 'inquiries' && conv.type !== 'INQUIRY') return false;
      if (filter === 'bookings' && conv.type !== 'BOOKING') return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = getChatTitle(conv).toLowerCase();
        const subtitle = getChatSubtitle(conv).toLowerCase();
        return title.includes(searchLower) || subtitle.includes(searchLower);
      }
      
      return true;
    })
    .sort((a, b) => {
      // Unread first, then by last message time
      if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
      if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="max-w-lg w-full h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-gradient-to-r from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
                  </p>
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
            
            {/* Search Bar */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-neutral-500 text-slate-900 dark:text-neutral-100 transition-all"
              />
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
                }`}
              >
                All
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">{totalUnread}</span>
                )}
              </button>
              <button
                onClick={() => setFilter('inquiries')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'inquiries'
                    ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Inquiries
                {inquiryUnread > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">{inquiryUnread}</span>
                )}
              </button>
              <button
                onClick={() => setFilter('bookings')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'bookings'
                    ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Bookings
                {bookingUnread > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">{bookingUnread}</span>
                )}
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-neutral-700 border-t-blue-500 animate-spin"></div>
                <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  {searchTerm ? 'No results found' : 'No conversations yet'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-xs">
                  {searchTerm 
                    ? 'Try a different search term' 
                    : user.role === 'customer'
                      ? 'Start a chat from a service page or your bookings'
                      : 'Customers will appear here when they message you'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                {filteredConversations.map((conv) => {
                  const hasUnread = (conv.unreadCount || 0) > 0;
                  
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedChat(conv)}
                      className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-all ${
                        hasUnread ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                            conv.type === 'INQUIRY' 
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                              : 'bg-gradient-to-br from-amber-500 to-orange-500'
                          }`}>
                            {getChatSubtitle(conv).charAt(0).toUpperCase()}
                          </div>
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className={`font-semibold truncate ${
                                hasUnread 
                                  ? 'text-slate-900 dark:text-white' 
                                  : 'text-slate-700 dark:text-neutral-300'
                              }`}>
                                {getChatTitle(conv)}
                              </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 flex-shrink-0">
                              {getTimeAgo(conv.lastMessageAt)}
                            </span>
                          </div>
                          
                          {/* Type & Status Badges */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {conv.type === 'INQUIRY' ? (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-md text-[10px] font-semibold">
                                Inquiry
                              </span>
                            ) : (
                              getBookingStatusBadge(conv)
                            )}
                            {conv.type === 'BOOKING' && conv.bookingId?.bookingDate && (
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 flex items-center gap-0.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(conv.bookingId.bookingDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            )}
                          </div>
                          
                          {/* Last Message Preview */}
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${
                              hasUnread 
                                ? 'text-slate-700 dark:text-neutral-200 font-medium' 
                                : 'text-slate-500 dark:text-neutral-400'
                            }`}>
                              {getChatSubtitle(conv)}
                            </p>
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                            <p className={`text-sm truncate flex-1 ${
                              hasUnread 
                                ? 'text-slate-600 dark:text-neutral-300' 
                                : 'text-slate-400 dark:text-neutral-500'
                            }`}>
                              {getLastMessage(conv)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <svg
                          className="w-5 h-5 text-slate-300 dark:text-neutral-600 flex-shrink-0 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
            <p className="text-[10px] text-center text-slate-400 dark:text-neutral-500">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} 
              {filter !== 'all' && ` in ${filter}`}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Chat Modal */}
      {selectedChat && (
        <ChatModal
          isOpen={!!selectedChat}
          onClose={() => {
            setSelectedChat(null);
            fetchConversations();
          }}
          conversationId={selectedChat._id}
          type={selectedChat.type}
          contextInfo={{
            serviceTitle: selectedChat.serviceId?.title,
            bookingTitle: selectedChat.bookingId?.service?.title,
          }}
        />
      )}
    </>
  );
};

export default ChatListModal;
