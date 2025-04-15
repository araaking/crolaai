'use client';

import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant'
}

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface AIModel {
  id: string;
  name: string;
  isReasoning: boolean;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  currentChatId: string | null;
  isSendingMessage: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  availableModels: AIModel[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

// Constant for selected model
const SELECTED_MODEL_KEY = 'chat_app_selected_model';

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load chats from database
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Anda harus login terlebih dahulu');
          return;
        }

        const response = await fetch('/api/chat/db', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error(`Failed to fetch chats: ${response.status}`);
        const data = await response.json();
        if (data.chats) {
          setChats(data.chats);
          // Set current chat to the first one if none selected
          if (!currentChatId && data.chats.length > 0) {
            setCurrentChatId(data.chats[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Gagal mengambil daftar chat.');
      }
    };

    fetchChats();
  }, [currentChatId]);

  // Load selected model from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSelectedModel = localStorage.getItem(SELECTED_MODEL_KEY);
      if (savedSelectedModel) {
        setSelectedModel(savedSelectedModel);
      }
      setIsInitialized(true);
    }
  }, []);

  // Effect to load messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chats.find(chat => chat.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId, chats]);

  // Save selected model to localStorage
  useEffect(() => {
    if (isInitialized && selectedModel) {
      localStorage.setItem(SELECTED_MODEL_KEY, selectedModel);
    }
  }, [selectedModel, isInitialized]);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setAvailableModels(data.models);
          if (isInitialized && !selectedModel && data.models.length > 0) {
            setSelectedModel(data.models[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setError('Gagal mengambil daftar model.');
      }
    };

    if (isInitialized) {
      fetchModels();
    }
  }, [isInitialized, selectedModel]);

  const updateSelectedModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        return;
      }

      const response = await fetch('/api/chat/db', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'Diskusi Baru' }),
      });

      if (!response.ok) throw new Error(`Failed to create chat: ${response.status}`);
      const data = await response.json();
      
      if (data.chat) {
        setChats(prev => [data.chat, ...prev]);
        setCurrentChatId(data.chat.id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Gagal membuat chat baru.');
    }
  }, []);

  const selectChat = useCallback((chatId: string) => {
    if (chatId !== currentChatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChatId(chatId);
      }
    }
  }, [chats, currentChatId]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        return;
      }

      const response = await fetch(`/api/chat/db?id=${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Failed to delete chat: ${response.status}`);

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Gagal menghapus chat.');
    }
  }, [chats, currentChatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSendingMessage || !selectedModel) return;

    setIsSendingMessage(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        return;
      }

      // Send message to AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: content,
          modelId: selectedModel,
          chatId: currentChatId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Gagal mengirim pesan');
      }

      const data = await response.json();

      // Refresh chats after sending message
      const chatsResponse = await fetch('/api/chat/db', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!chatsResponse.ok) throw new Error('Failed to refresh chats');
      const chatsData = await chatsResponse.json();
      
      if (chatsData.chats) {
        setChats(chatsData.chats);
        // Update messages if current chat
        const updatedChat = chatsData.chats.find((c: Chat) => c.id === currentChatId);
        if (updatedChat) {
          // Get only the AI response from updated messages
          const aiMessages = updatedChat.messages.filter((m: Message) => 
            m.role === MessageRole.Assistant && 
            !messages.some(existingMsg => existingMsg.id === m.id)
          );
          
          console.log('Current messages:', messages);
          console.log('AI messages from API:', aiMessages);
          console.log('All messages from API:', updatedChat.messages);

          // Add AI response to existing messages
          setMessages(prev => [...prev, ...aiMessages]);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentChatId, isSendingMessage, selectedModel, messages]);

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      currentChatId,
      isSendingMessage,
      isLoadingMessages,
      error,
      availableModels,
      selectedModel,
      setSelectedModel: updateSelectedModel,
      createNewChat,
      selectChat,
      deleteChat,
      sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 