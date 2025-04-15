// app/page.tsx
'use client'; // Gunakan client component jika perlu interaksi browser (misal cek token)

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Cek token di localStorage saat komponen dimuat di client-side
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      // Jika tidak ada token, mungkin arahkan kembali ke login
      // router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    router.push('/login'); // Arahkan ke login setelah logout
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to AI Chat</h1>
      {isLoggedIn ? (
        <div>
          <p>You are logged in.</p>
          {/* Link ke halaman chat yang sudah dibuat */}
          <p>
            <a 
              href="/chat" 
              style={{ 
                color: '#9333ea', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                padding: '10px 20px', 
                backgroundColor: 'rgba(147, 51, 234, 0.1)', 
                borderRadius: '6px', 
                display: 'inline-block', 
                marginTop: '10px' 
              }}
            >
              Start Chatting with AI
            </a>
          </p>
          <button onClick={handleLogout} style={{ marginTop: '15px', padding: '8px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <p><a href="/login" style={{ color: 'blue' }}>Login</a> or <a href="/signup" style={{ color: 'blue' }}>Sign Up</a></p>
        </div>
      )}
    </div>
  );
}
