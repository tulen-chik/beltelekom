"use client"
import React, { useState, useEffect } from 'react';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default function Page() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (!userRole) {
            // Если роль не найдена, перенаправляем на страницу входа
            window.location.href = '/login'; // Используем window.location для перенаправления
        } else {
            setRole(userRole);
        }
    }, []);

    if (!role) return <div>Loading...</div>;

    return (
        <div>
            {role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
        </div>
    );
}
