import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../ui/Card';
import PrimaryButton from '../ui/PrimaryButton';
import { getApiUrl } from '../../config/api';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/admin/messages'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Failed to fetch messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReplyClick = (message) => {
    setReplyModal(message);
    setReplySubject(`Re: ${message.subject}`);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!replySubject.trim() || !replyMessage.trim()) {
      showNotification('Please fill in both subject and message', 'error');
      return;
    }

    try {
      setSendingReply(true);
      const token = localStorage.getItem('token');
      await axios.post(
        getApiUrl(`api/admin/messages/${replyModal._id}/reply`),
        {
          subject: replySubject,
          message: replyMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification('Reply sent successfully!', 'success');
      setReplyModal(null);
      setReplySubject('');
      setReplyMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      showNotification(
        error.response?.data?.message || 'Failed to send reply',
        'error'
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteClick = (message) => {
    setDeleteConfirm(message);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        getApiUrl(`api/admin/messages/${deleteConfirm._id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification('Message deleted successfully', 'success');
      setDeleteConfirm(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete message',
        'error'
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const readCount = messages.filter((m) => m.isRead).length;

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !message.isRead) ||
      (filterStatus === 'read' && message.isRead);

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] backdrop-blur-sm`}
          >
            {notification.type === 'success' ? (
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <p className="font-semibold">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Messages</h2>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Manage and reply to customer inquiries
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-200 dark:border-blue-500/30">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                {unreadCount} unread
              </div>
            )}
            <PrimaryButton onClick={fetchMessages} variant="ghost" size="sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </PrimaryButton>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-w-[160px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All ({messages.length})</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="read">Read ({readCount})</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-neutral-400">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-400 dark:text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-slate-900 dark:text-neutral-100 text-lg font-semibold mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No messages found' : 'No messages yet'}
          </p>
          <p className="text-slate-500 dark:text-neutral-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Contact form submissions will appear here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card
              key={message._id}
              className={`p-6 hover:shadow-lg transition-all duration-300 ${
                !message.isRead
                  ? 'border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-100 dark:ring-blue-900/30'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Message Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 truncate">
                          {message.subject}
                        </h3>
                        {!message.isRead && (
                          <span className="px-2.5 py-1 bg-blue-500 dark:bg-blue-400 text-white rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            New
                          </span>
                        )}
                      </div>

                      {/* Sender Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-neutral-100">{message.name}</p>
                            <p className="text-slate-500 dark:text-neutral-400 text-xs">{message.email}</p>
                          </div>
                        </div>
                        {message.company && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-xs">{message.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="mt-4 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Message
                    </p>
                    <p className="text-slate-700 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                      {message.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 lg:flex-shrink-0">
                  <PrimaryButton
                    onClick={() => handleReplyClick(message)}
                    className="flex-1 lg:w-auto"
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Reply
                  </PrimaryButton>
                  <button
                    onClick={() => handleDeleteClick(message)}
                    className="px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-3xl w-full my-8 shadow-2xl">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-neutral-700">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100">Reply to Message</h2>
                      <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
                        Replying to <span className="font-semibold text-slate-900 dark:text-neutral-100">{replyModal.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase mb-1">Original Message</p>
                    <p className="text-sm text-slate-700 dark:text-neutral-300 font-medium">{replyModal.subject}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReplyModal(null);
                    setReplySubject('');
                    setReplyMessage('');
                  }}
                  className="ml-4 p-2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                  disabled={sendingReply}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="replySubject"
                    className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="replySubject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter reply subject..."
                    disabled={sendingReply}
                  />
                </div>

                <div>
                  <label
                    htmlFor="replyMessage"
                    className="block text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="replyMessage"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Type your reply here..."
                    disabled={sendingReply}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
                    {replyMessage.length} characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-neutral-700">
                <button
                  onClick={() => {
                    setReplyModal(null);
                    setReplySubject('');
                    setReplyMessage('');
                  }}
                  disabled={sendingReply}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleSendReply}
                  disabled={sendingReply || !replySubject.trim() || !replyMessage.trim()}
                  className="flex-1"
                  icon={
                    sendingReply ? (
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )
                  }
                  iconPosition="left"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                    Delete Message?
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 mb-6">
                <p className="text-sm text-slate-600 dark:text-neutral-400">
                  Are you sure you want to delete this message from{' '}
                  <strong className="text-slate-900 dark:text-neutral-100">{deleteConfirm.name}</strong>?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
