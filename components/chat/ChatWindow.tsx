'use client';

import React, { useEffect, useRef } from 'react';
import { useChat, MessageRole } from '@/components/providers/ChatProvider';
import { useAuth } from '@/hooks/useAuth';
import MessageInput from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Loader2, AlertCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatWindow() {
  const { 
    messages, 
    isLoadingMessages, 
    error, 
    currentChatId,
    availableModels,
    selectedModel,
    setSelectedModel,
    isSendingMessage
  } = useChat();
  
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingMessages]);

  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'A';
  };

  // Find selected model name for display
  const selectedModelName = availableModels.find(m => m.id === selectedModel)?.name || 'Model AI';
  
  console.log('Rendering messages:', messages);

  return (
    <main className="flex-grow flex flex-col bg-white relative">
      {/* Header (Model Selector) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-base font-normal text-gray-800 hover:text-gray-900">
              {selectedModelName}
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-gray-200 text-gray-800 rounded-md shadow-lg">
            <DropdownMenuLabel className="text-gray-500">Pilih Model</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200"/>
            {availableModels.map(model => (
              <DropdownMenuItem 
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  "hover:bg-gray-100 focus:bg-gray-100 cursor-pointer",
                  selectedModel === model.id && "bg-gray-100 font-medium"
                )}
              >
                {model.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-xl font-semibold text-gray-800">{getInitials(user?.email)}</div>
      </div>

      {/* Welcome Message */}
      {!currentChatId && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Selamat datang, {user?.email || 'Pengguna'}</h1>
          <p className="text-gray-500 mb-8">Apa yang bisa saya bantu hari ini?</p>
        </div>
      )}

      {/* Message Display Area */}
      {currentChatId && (
        <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {isLoadingMessages && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}

            {!isLoadingMessages && error && (
              <div className="flex flex-col items-center justify-center text-center text-red-500 py-10">
                <AlertCircle className="h-8 w-8 mb-2"/>
                <p className="font-semibold">Gagal memuat pesan</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!isLoadingMessages && !error && messages.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <p>Kirim pesan untuk memulai percakapan.</p>
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
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm',
                    message.role === MessageRole.User
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === MessageRole.User && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'default'}.png?size=32`} alt="User Avatar" />
                    <AvatarFallback className="bg-blue-500 text-white">{getInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isSendingMessage && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm bg-gray-100 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span>Mengetik...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Message Input Area */}
      <div className="p-4 md:px-6 md:pb-6 border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          <MessageInput />
        </div>
      </div>
    </main>
  );
} 