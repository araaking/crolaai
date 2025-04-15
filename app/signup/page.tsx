// app/signup/page.tsx
'use client'; // Menandakan ini adalah Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Gunakan next/navigation di App Router

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Tangani error dari backend (gunakan pesan error dari response jika ada)
        throw new Error(data.error || `Error ${res.status}: Failed to sign up`);
      }

      // Signup berhasil
      console.log('Signup successful:', data);
      // Arahkan ke halaman login setelah signup berhasil
      router.push('/login?signupSuccess=true');

    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8} // Cocokkan dengan validasi backend
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Already have an account? <a href="/login" style={{ color: 'blue' }}>Login</a>
      </p>
    </div>
  );
}
