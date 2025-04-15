'use client';

import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

export default function ChatLayout() {
  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
} 