// src/app/(protected)/profile/page.tsx
import ProfileForm from "@/components/settings/ProfileForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

async function getUser() {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) return null;

    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
        headers: { Cookie: `jwt=${jwt}` },
        credentials: 'include',
        cache: 'no-store'
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
}

export default async function ProfilePage() {
    const user = await getUser();
    if (!user) redirect('/signin');

    return <ProfileForm />;
}