'use client';

import DashboardClient from "./DashboardClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('DASHBOARD CHECK:', { loading, user: user?.email });
    if (loading) return; // Đợi loading xong
    if (!user) router.push('/signin');
    else if (!user.username || !user.level || !user.avatar) router.push('/onboarding');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-edu-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <DashboardClient />;
}