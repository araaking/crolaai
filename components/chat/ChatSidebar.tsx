'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, Settings, MessageSquare, Loader2 } from 'lucide-react';

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, selectChat, createNewChat, currentChatId, isLoadingMessages, isSendingMessage } = useChat();
  const { user, logout } = useAuth();

  const handleNewChat = () => {
    createNewChat();
  };

  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700 flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-purple-400" />
          <span className="font-semibold text-lg">Chat MVP</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings size={18} />
        </Button>
      </div>

      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        disabled={isSendingMessage}
      >
        {isSendingMessage && currentChatId === null ? (
          <Loader2 size={18} className="mr-2 animate-spin" />
        ) : (
          <Plus size={18} className="mr-2" />
        )}
        New Chat
      </Button>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          type="search"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full bg-gray-700 border-gray-600 placeholder-gray-400 text-white rounded-md focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 -mr-4 pr-3">
        <nav className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">All chats</h3>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                onClick={() => selectChat(chat.id)}
                disabled={isLoadingMessages && currentChatId === chat.id}
                className={`w-full justify-start items-center p-2 rounded-md hover:bg-gray-700 text-sm text-gray-300 transition-colors duration-150 ${currentChatId === chat.id ? 'bg-gray-700 text-white' : ''}`}
              >
                {isLoadingMessages && currentChatId === chat.id ? (
                  <Loader2 size={16} className="mr-3 flex-shrink-0 animate-spin" />
                ) : (
                  <MessageSquare size={16} className="mr-3 flex-shrink-0" />
                )}
                <span className="truncate">{chat.title || 'Untitled Chat'}</span>
              </Button>
            ))
          ) : (
            <p className="px-2 text-sm text-gray-500">No chats found.</p>
          )}
        </nav>
      </ScrollArea>

      {/* User Profile Footer */}
      <div className="mt-4 border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors duration-150">
          <div className="flex items-center gap-3 cursor-pointer truncate">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'default'}.png?size=32`} alt="User Avatar" />
              <AvatarFallback className="text-xs bg-purple-600 text-white">{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{user?.email || 'User'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-white">Logout</Button>
        </div>
      </div>
    </aside>
  );
} 