'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/components/providers/ChatProvider';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, Settings, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { chats, selectChat, createNewChat, currentChatId, isLoadingMessages, deleteChat } = useChat();
  const { user } = useAuth();

  const handleNewChat = () => {
    createNewChat();
  };

  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'A';
  };

  return (
    <aside className="w-64 bg-white p-2 flex flex-col border-r border-gray-200 flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-purple-100">
            <AvatarFallback className="text-purple-600">AI</AvatarFallback>
          </Avatar>
          <span className="font-medium text-lg">Chat AI</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
          <Settings size={18} />
        </Button>
      </div>

      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Chat Baru
      </Button>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          type="search"
          placeholder="Cari"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full bg-gray-100 border-gray-200 placeholder-gray-400 text-gray-800 rounded-md focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 -mr-4 pr-3">
        <nav className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">SEMUA CHAT</h3>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                className={`flex items-center group hover:bg-gray-100 rounded-md ${currentChatId === chat.id ? 'bg-gray-100' : ''}`}
              >
                <Button
                  variant="ghost"
                  onClick={() => selectChat(chat.id)}
                  disabled={isLoadingMessages && currentChatId === chat.id}
                  className={`w-full justify-start items-center p-2 rounded-md text-sm text-gray-600 transition-colors duration-150 ${currentChatId === chat.id ? 'text-gray-800' : ''}`}
                >
                  <MessageSquare size={16} className="mr-3 flex-shrink-0" />
                  <span className="truncate">{chat.title || 'Chat Baru'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-500 hover:text-red-500 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          ) : (
            searchQuery ? (
              <p className="text-sm text-gray-500 px-2">Tidak ada chat yang ditemukan</p>
            ) : (
              <div className="space-y-1">
                <div className="p-2 text-sm text-center text-gray-500">
                  Belum ada chat. Klik "Chat Baru" untuk memulai.
                </div>
              </div>
            )
          )}
        </nav>
      </ScrollArea>

      {/* User Profile Footer */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150">
          <div className="flex items-center gap-3 cursor-pointer truncate">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-gray-200 text-gray-600">{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate text-gray-700">{user?.email || 'Pengguna'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
} 