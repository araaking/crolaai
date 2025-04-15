'use client';

import React, { useState, FormEvent } from 'react';
import { useChat } from '@/components/providers/ChatProvider';
import { Button } from '@/components/ui/button';
import { MicIcon, Search, Loader2 } from 'lucide-react';

export default function MessageInput() {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, isSendingMessage, selectedModel } = useChat();

  const handleSendMessage = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isSendingMessage && selectedModel) {
      sendMessage(trimmedInput);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="w-full">
      <div className="relative">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Apa yang ingin Anda tanyakan?"
          className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSendingMessage || !selectedModel}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100" type="button" disabled={isSendingMessage}>
            <MicIcon size={18} className="text-gray-400" />
          </Button>
          <Button 
            className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600"
            type="submit"
            disabled={isSendingMessage || !inputValue.trim() || !selectedModel}
          >
            {isSendingMessage ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Search size={16} className="text-white rotate-90" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center mt-2 gap-2">
        <Button variant="outline" className="rounded-full px-4 py-1 text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50" type="button">Artifacts</Button>
        <Button variant="outline" className="rounded-full px-4 py-1 text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50" type="button">Generasi Gambar</Button>
        <Button variant="outline" className="rounded-full px-4 py-1 text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50" type="button">Generasi Video</Button>
        <Button variant="outline" className="rounded-full px-4 py-1 text-xs bg-white border-gray-300 text-gray-700 hover:bg-gray-50" type="button">Lainnya</Button>
      </div>
    </form>
  );
} 