"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import WritingClient from './WritingClient';


export default function WritingSelectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('WRITING PAGE CHECK:', { loading, user: user?.email });
    if (loading) return;
    if (!user) router.replace('/signin');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-edu-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <WritingClient />;
}