'use client';

import React, { useEffect, useRef } from 'react';
import { useChat, MessageRole } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import MessageInput from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Loader2, AlertCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatWindow() {
  const { messages, isLoadingMessages, error, currentChatId } = useChat();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingMessages]);

  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <main className="flex-grow flex flex-col bg-gray-900 relative">
      {/* Header (Model Selector & User Avatar) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold text-gray-200 hover:text-white">
              AI Model <span className="text-gray-400 text-sm">(Default)</span>
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white rounded-md shadow-lg">
            <DropdownMenuLabel className="text-gray-400">Select Model</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700"/>
            <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">Default Model (e.g., GPT-4o)</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer" disabled>Another Model (Soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar className="h-9 w-9">
          <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'default'}.png?size=36`} alt="User Avatar" />
          <AvatarFallback className="bg-purple-600 text-white">{getInitials(user?.email)}</AvatarFallback>
        </Avatar>
      </div>

      {/* Message Display Area */}
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {isLoadingMessages && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          )}

          {!isLoadingMessages && error && (
            <div className="flex flex-col items-center justify-center text-center text-red-500 py-10">
              <AlertCircle className="h-8 w-8 mb-2"/>
              <p className="font-semibold">Failed to load messages</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!isLoadingMessages && !error && messages.length === 0 && currentChatId && (
            <div className="text-center text-gray-500 py-10">
              <p>Send a message to start the conversation.</p>
            </div>
          )}

          {!isLoadingMessages && !error && messages.length === 0 && !currentChatId && (
            <div className="text-center text-gray-400 py-10 px-4">
              <h1 className="text-2xl font-semibold mb-2 text-gray-100">Welcome, {user?.email || 'User'}!</h1>
              <p>Select a chat from the sidebar or start a new one.</p>
            </div>
          )}

          {!isLoadingMessages && !error && messages.map((message, index) => (
            <div
              key={message.id || `msg-${index}`}
              className={cn(
                'flex items-start gap-3',
                message.role === MessageRole.User ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === MessageRole.Assistant && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gray-700 text-purple-400">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg px-4 py-2 text-sm',
                  message.role === MessageRole.User
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === MessageRole.User && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'default'}.png?size=32`} alt="User Avatar" />
                  <AvatarFallback className="bg-purple-600 text-white">{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      {currentChatId && (
        <div className="p-4 md:px-6 md:pb-4 border-t border-gray-700 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            <MessageInput />
          </div>
        </div>
      )}
    </main>
  );
} 