"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Page() {
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (!userRole) {
            router.push('/login');
        } else {
            setRole(userRole);
        }
    }, [router]);

    if (!role) return <div>Loading...</div>;

    return (
        <div>
            {role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </div>
    );
}