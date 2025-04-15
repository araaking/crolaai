'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <LoginForm />
      </div>
    </AuthProvider>
  );
} 