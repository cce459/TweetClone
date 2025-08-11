import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
  }>;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { setTheme, theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user/me"],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations", currentUser?.id],
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string; senderId: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
    },
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      senderId: currentUser.id,
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUser?.id);
  };

  return (
    <div className="min-h-screen bg-twitter-background dark:bg-black flex max-w-7xl mx-auto">
      <Sidebar onTweetClick={() => {}} />
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-twitter-extra-light-gray dark:border-gray-800 lg:hidden z-50">
        <div className="flex justify-around py-3">
          <Link href="/">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-home text-xl"></i>
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-search text-xl"></i>
            </Button>
          </Link>
          <Link href="/notifications">
            <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
              <i className="fas fa-bell text-xl"></i>
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="ghost" className="p-2 text-twitter-blue">
              <i className="fas fa-envelope text-xl"></i>
            </Button>
          </Link>
        </div>
      </div>

      <main className="flex-1 lg:max-w-2xl border-r border-twitter-extra-light-gray dark:border-gray-800 flex">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : ''} w-full lg:w-80 border-r border-twitter-extra-light-gray dark:border-gray-800`}>
          <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 z-40">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-twitter-black dark:text-white">Messages</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="p-2 text-twitter-dark-gray dark:text-gray-400">
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="p-2 text-twitter-dark-gray dark:text-gray-400"
                >
                  <i className={`fas fa-${theme === "dark" ? "sun" : "moon"}`}></i>
                </Button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-twitter-extra-light-gray dark:divide-gray-800">
            {conversationsLoading ? (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-twitter-blue text-2xl"></i>
                <p className="mt-2 text-twitter-dark-gray dark:text-gray-400">Loading conversations...</p>
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 hover:bg-twitter-extra-light-gray dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id ? 'bg-twitter-blue bg-opacity-10' : ''
                    }`}
                  >
                    <div className="flex space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                        <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-bold text-twitter-black dark:text-white truncate">
                              {otherUser?.name}
                            </h3>
                            {otherUser?.verified && (
                              <i className="fas fa-check-circle text-twitter-blue text-sm"></i>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-twitter-dark-gray dark:text-gray-400">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-twitter-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-twitter-dark-gray dark:text-gray-400 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <i className="fas fa-envelope text-twitter-dark-gray dark:text-gray-400 text-4xl mb-4"></i>
                <h2 className="text-xl font-bold text-twitter-black dark:text-white mb-2">
                  No messages yet
                </h2>
                <p className="text-twitter-dark-gray dark:text-gray-400">
                  Start a conversation with someone to see your messages here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="sticky top-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md border-b border-twitter-extra-light-gray dark:border-gray-800 p-4 z-40">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2"
                >
                  <i className="fas fa-arrow-left text-twitter-black dark:text-white"></i>
                </Button>
                {conversations && (() => {
                  const conversation = conversations.find(c => c.id === selectedConversation);
                  const otherUser = conversation ? getOtherParticipant(conversation) : null;
                  return otherUser ? (
                    <>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h2 className="font-bold text-twitter-black dark:text-white">{otherUser.name}</h2>
                          {otherUser.verified && (
                            <i className="fas fa-check-circle text-twitter-blue text-sm"></i>
                          )}
                        </div>
                        <p className="text-sm text-twitter-dark-gray dark:text-gray-400">@{otherUser.username}</p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-twitter-blue text-xl"></i>
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === currentUser?.id
                          ? 'bg-twitter-blue text-white'
                          : 'bg-twitter-extra-light-gray dark:bg-gray-800 text-twitter-black dark:text-white'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id
                          ? 'text-blue-100'
                          : 'text-twitter-dark-gray dark:text-gray-400'
                      }`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-twitter-dark-gray dark:text-gray-400">
                  <p>Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-twitter-extra-light-gray dark:border-gray-800">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Start a new message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-twitter-extra-light-gray dark:bg-gray-800 border-none rounded-full h-10 px-4 text-twitter-black dark:text-white placeholder-twitter-dark-gray dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-twitter-blue"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-twitter-blue hover:bg-twitter-dark-blue text-white rounded-full px-4 disabled:opacity-50"
                >
                  {sendMessageMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <i className="fas fa-envelope text-twitter-dark-gray dark:text-gray-400 text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-twitter-black dark:text-white mb-2">
                Select a message
              </h2>
              <p className="text-twitter-dark-gray dark:text-gray-400">
                Choose from your existing conversations or start a new one.
              </p>
            </div>
          </div>
        )}
      </main>

      <RightSidebar />
    </div>
  );
}