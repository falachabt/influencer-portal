'use client';
// src/app/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers la page de login
    router.replace('/login');
  }, [router]);

  return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
  );
}