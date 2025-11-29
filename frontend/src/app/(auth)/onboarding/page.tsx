'use client';

import ProfileForm from "@/components/settings/ProfileForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function OnboardingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/signin');
            else if (user.username && user.level && user.avatar) router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    if (!user) return null;

    return <ProfileForm isOnboarding={true} />;
}