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

// Constants for localStorage keys
const CHATS_STORAGE_KEY = 'chat_app_chats';
const CURRENT_CHAT_ID_KEY = 'chat_app_current_chat_id';
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

  // Load initial state from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);
        const savedCurrentChatId = localStorage.getItem(CURRENT_CHAT_ID_KEY);
        const savedSelectedModel = localStorage.getItem(SELECTED_MODEL_KEY);
        
        const initialChats = savedChats ? JSON.parse(savedChats) : [];
        const initialCurrentChatId = savedCurrentChatId || null;
        const initialSelectedModel = savedSelectedModel || "";

        setChats(initialChats);
        setCurrentChatId(initialCurrentChatId);
        setSelectedModel(initialSelectedModel);
        
        setIsInitialized(true);
        console.log("Chat state initialized from localStorage:", { chats: initialChats.length, currentChatId: initialCurrentChatId, selectedModel: initialSelectedModel });
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      localStorage.removeItem(CHATS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_CHAT_ID_KEY);
      localStorage.removeItem(SELECTED_MODEL_KEY);
      setIsInitialized(true); // Mark as initialized even on error to prevent loops
    }
  }, []);

  // Effect to load messages when currentChatId changes or chats are loaded
  useEffect(() => {
    if (isInitialized && currentChatId) {
      const currentChat = chats.find(chat => chat.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages);
      } else {
        // If currentChatId exists but chat is not found (e.g., data corruption), reset
        console.warn(`Chat with ID ${currentChatId} not found in loaded chats. Resetting current chat.`);
        setCurrentChatId(null);
        setMessages([]);
        localStorage.removeItem(CURRENT_CHAT_ID_KEY);
      }
    } else if (isInitialized && !currentChatId) {
        setMessages([]); // Clear messages if no chat is selected
    }
  }, [currentChatId, chats, isInitialized]);

  // Save chats to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
      console.log(`Saved ${chats.length} chats to localStorage.`);
    }
  }, [chats, isInitialized]);

  // Save current chat ID to localStorage
  useEffect(() => {
    if (isInitialized) {
      if (currentChatId) {
        localStorage.setItem(CURRENT_CHAT_ID_KEY, currentChatId);
      } else {
        localStorage.removeItem(CURRENT_CHAT_ID_KEY);
      }
      console.log(`Saved currentChatId (${currentChatId}) to localStorage.`);
    }
  }, [currentChatId, isInitialized]);

  // Save selected model to localStorage
  useEffect(() => {
    if (isInitialized) {
      if (selectedModel) {
        localStorage.setItem(SELECTED_MODEL_KEY, selectedModel);
      } else {
        localStorage.removeItem(SELECTED_MODEL_KEY);
      }
      console.log(`Saved selectedModel (${selectedModel}) to localStorage.`);
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
          // Set default model only if not already set from localStorage
          if (isInitialized && !selectedModel && data.models.length > 0) {
            setSelectedModel(data.models[0].id);
          }
        } else {
          console.error('Invalid models data format:', data);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setError('Gagal mengambil daftar model.');
      }
    };

    if (isInitialized) { // Fetch models only after state is initialized
      fetchModels();
    }
  }, [isInitialized, selectedModel]); // Rerun if selectedModel is initially empty

  const updateSelectedModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    // Saving is handled by the useEffect hook
  }, []);

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: 'Diskusi Baru',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    // Saving chats and currentChatId is handled by useEffect hooks
  }, []);

  const selectChat = useCallback((chatId: string) => {
    if (chatId !== currentChatId) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          setCurrentChatId(chatId);
          // Loading messages and saving currentChatId is handled by useEffect hooks
        } else {
          console.warn(`Attempted to select non-existent chat ID: ${chatId}`);
        }
    }
  }, [chats, currentChatId]);

  const deleteChat = useCallback((chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChatId === chatId) {
      const newCurrentChatId = updatedChats.length > 0 ? updatedChats[0].id : null;
      setCurrentChatId(newCurrentChatId);
    }
    // Saving chats and currentChatId is handled by useEffect hooks
  }, [chats, currentChatId]);

  const sendMessage = useCallback(async (content: string) => {
    let currentTargetChatId = currentChatId;

    if (!content.trim() || isSendingMessage || !selectedModel) return;

    setIsSendingMessage(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content
    };

    // If no chat is selected, create one first
    if (!currentTargetChatId) {
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: content.length > 30 ? content.substring(0, 30) + '...' : content,
        messages: [userMessage]
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([userMessage]); // Set messages directly for the new chat
      currentTargetChatId = newChatId;
    } else {
      // Add message to the existing current chat
      setMessages(prev => [...prev, userMessage]);
      setChats(prev => prev.map(chat => 
        chat.id === currentTargetChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      ));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, modelId: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error: ${response.status} - ${errorData?.error || 'Gagal mengirim pesan'}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Assistant,
        content: data.response || 'Maaf, terjadi kesalahan.'
      };

      // Add assistant message to the correct chat
      setMessages(prev => [...prev, assistantMessage]);
      setChats(prev => prev.map(chat => 
        chat.id === currentTargetChatId
          ? { 
              ...chat, 
              messages: [...chat.messages, assistantMessage],
              // Update title only if it was the default title and this is the first assistant message
              title: (chat.title === 'Diskusi Baru' && chat.messages.length === 1) ? content.substring(0, 30) + '...' : chat.title
            }
          : chat
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pesan';
      setError(errorMessage);
      console.error('Error sending message:', err);
      // Optionally add an error message to the chat
      const errorAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Assistant,
        content: `Error: ${errorMessage}`
      };
      setMessages(prev => [...prev, errorAIMessage]);
      setChats(prev => prev.map(chat => 
        chat.id === currentTargetChatId
          ? { ...chat, messages: [...chat.messages, errorAIMessage] }
          : chat
      ));
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentChatId, isSendingMessage, selectedModel, chats]); // Removed createNewChat as it's handled internally now

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