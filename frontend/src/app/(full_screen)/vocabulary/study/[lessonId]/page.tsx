'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import StudyClient from './StudyClient';

export default function StudyPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const unwrapped = React.use(params);
  const lessonId = unwrapped.lessonId;

  useEffect(() => {
    console.log('STUDY PAGE CHECK:', { loading, user: user?.email });
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

  return <StudyClient lessonId={lessonId} />;
}