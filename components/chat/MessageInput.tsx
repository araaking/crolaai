'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Plus, Mic, Loader2, AlertCircle } from 'lucide-react';

export default function MessageInput() {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, isSendingMessage, error } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isSendingMessage) {
      sendMessage(trimmedInput);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="relative w-full">
      {error && !isSendingMessage && (
        <div className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-red-500 mb-1">
          <AlertCircle size={14} /> Error sending: {error.length > 50 ? error.substring(0, 50) + '...' : error}
        </div>
      )}
      <div className="flex items-end gap-2 bg-gray-800 rounded-lg p-2 border border-gray-700 shadow-lg">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white flex-shrink-0" type="button">
          <Plus size={20} />
        </Button>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Shift+Enter for newline)"
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none overflow-y-hidden max-h-40 min-h-[40px] px-2 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          rows={1}
          disabled={isSendingMessage}
        />
        <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-gray-700 rounded-full flex-shrink-0" type="button" disabled={isSendingMessage}>
          <Mic size={20} />
        </Button>
        <Button
          type="submit"
          size="icon"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full flex-shrink-0"
          disabled={isSendingMessage || !inputValue.trim()}
        >
          {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <SendHorizontal size={20} />}
        </Button>
      </div>
    </form>
  );
} 