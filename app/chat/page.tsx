'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, LogOut } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definisikan tipe untuk pesan
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  reasoning?: {
    message: string;
    contents?: string[];
  };
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface Model {
  id: string;
  name: string;
  isReasoning: boolean;
}

// Komponen animasi thinking untuk model biasa
const ThinkingAnimation = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Komponen animasi untuk model reasoning
const ReasoningAnimation = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { message: "Understanding user query...", content: "Analyzing input parameters and context" },
    { message: "Analyzing context...", content: "Evaluating relevant information and requirements" },
    { message: "Formulating response...", content: "Generating comprehensive solution" },
    { message: "Validating output...", content: "Checking accuracy and completeness" },
    { message: "Finalizing...", content: "Preparing final response" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000); // Ganti step setiap 2 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm text-gray-500">Sedang berpikir...</div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 animate-thinking-progress"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="animate-spin h-4 w-4 text-blue-500">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
          </svg>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <div className="p-2 bg-gray-50 rounded border border-gray-200">
          <div className="font-medium text-gray-700 mb-1">Reasoning Process:</div>
          <div className="text-gray-600">{steps[step].message}</div>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            {JSON.stringify({
              current_step: step + 1,
              total_steps: steps.length,
              status: "processing",
              details: steps[step].content
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Komponen untuk menampilkan reasoning steps
const ReasoningSteps = ({ reasoning }: { reasoning?: { message: string; contents?: string[] } }) => {
  if (!reasoning) return null;
  
  return (
    <div className="mt-2 text-sm">
      <div className="p-2 bg-gray-50 rounded border border-gray-200">
        <div className="font-medium text-gray-700 mb-1">{reasoning.message}</div>
        {reasoning.contents && (
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            {JSON.stringify(reasoning.contents, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fungsi untuk auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Ambil daftar model yang tersedia
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setAvailableModels(data.models);
          if (data.models.length > 0) {
            setSelectedModel(data.models[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    // Cek token di localStorage saat komponen dimuat
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      setUserName('Atech Site');
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || !selectedModel) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedMessage,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          message: trimmedMessage,
          modelId: selectedModel 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response,
        ...(data.reasoning && { reasoning: data.reasoning })
      };

      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll ketika ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Cek apakah model adalah tipe reasoning
  const isReasoningModel = (modelId: string) => {
    const model = availableModels.find((m: Model) => m.id === modelId);
    return model?.isReasoning || false;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-semibold">Chat AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Model Selector */}
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-white text-gray-800">
              {isReasoningModel(selectedModel) ? <ReasoningAnimation /> : <ThinkingAnimation />}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !message.trim() || !selectedModel}>
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
