'use client';

import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

export default function ChatLayout() {
  return (
    <div className="flex h-screen w-screen bg-white text-gray-800 font-sans overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
} 