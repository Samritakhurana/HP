import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Search, User, Clock } from "lucide-react";
import { useMessages } from "../hooks/useMessages";
import { useUsers } from "../hooks/useUsers";
import { format } from "date-fns";

const Messages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage,
    markAsRead,
  } = useMessages();
  const { users } = useUsers();
  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      message.receiver?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || !newMessage.trim()) {
      alert("Please select at least one recipient and enter a message");
      return;
    }

    // Send message to all selected users
    const results = await Promise.all(
      selectedUsers.map((userId) => sendMessage(userId, newMessage))
    );

    const failedCount = results.filter((r) => !r.success).length;

    if (failedCount === 0) {
      setNewMessage("");
      setSelectedUsers([]);
      setSelectAllUsers(false);
      setShowComposeForm(false);
      alert(
        `Message sent successfully to ${selectedUsers.length} recipient(s)!`
      );
    } else if (failedCount < selectedUsers.length) {
      alert(
        `Message sent to ${
          selectedUsers.length - failedCount
        } recipient(s). ${failedCount} failed.`
      );
    } else {
      alert("Failed to send message to all recipients");
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAllUsers) {
      setSelectedUsers([]);
      setSelectAllUsers(false);
    } else {
      setSelectedUsers(users.map((user) => user.id));
      setSelectAllUsers(true);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    const result = await markAsRead(messageId);
    if (!result.success) {
      alert(result.error || "Failed to mark message as read");
    }
  };

  const unreadMessages = messages.filter((message) => !message.is_read);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Communicate with team members
          </p>
        </div>
        <button
          onClick={() => setShowComposeForm(true)}
          className="mt-4 sm:mt-0 bg-hp-blue hover:bg-hp-dark-blue text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Compose Message</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Messages
              </p>
              <p className="text-2xl font-bold text-hp-blue">
                {messages.length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-hp-blue" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread Messages
              </p>
              <p className="text-2xl font-bold text-red-600">
                {unreadMessages.length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Conversations
              </p>
              <p className="text-2xl font-bold text-green-600">
                {
                  new Set([
                    ...messages.map((m) => m.sender_id),
                    ...messages.map((m) => m.receiver_id),
                  ]).size
                }
              </p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Messages
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                !message.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              onClick={() => !message.is_read && handleMarkAsRead(message.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-hp-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {message.sender?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.sender?.full_name || "Unknown User"}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        to
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {message.receiver?.full_name || "Unknown User"}
                      </span>
                      {!message.is_read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(message.created_at), "MMM dd, HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hp-blue"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Loading more...
            </span>
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerRef} className="h-1" />

        {!hasMore && messages.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No more messages to load
            </p>
          </div>
        )}

        {filteredMessages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No messages found
            </p>
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showComposeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compose Message
            </h3>
            <form onSubmit={handleSendMessage}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Send To ({selectedUsers.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-hp-blue hover:text-hp-dark-blue font-medium"
                    >
                      {selectAllUsers ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto p-3 space-y-2">
                    {users.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No users available
                      </p>
                    ) : (
                      users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="w-4 h-4 text-hp-blue border-gray-300 rounded focus:ring-hp-blue"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedUsers.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      💡 Message will be sent to {selectedUsers.length}{" "}
                      recipient{selectedUsers.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    required
                    placeholder="Type your message here..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={selectedUsers.length === 0}
                  className="flex-1 bg-hp-blue hover:bg-hp-dark-blue text-white py-2 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowComposeForm(false);
                    setSelectedUsers([]);
                    setSelectAllUsers(false);
                    setNewMessage("");
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
