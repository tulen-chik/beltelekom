"use client"
import Link from 'next/link'
import Header from "@/components/header"
import {useState, useCallback} from "react";
import axios from "axios";

export default function Component() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/login', {
                username,
                password,
            });
            setMessage('Call added successfully');
        } catch (error) {
            setMessage('Failed to add call');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Логин:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Войти</button>
                </form>
                {message && <p className="mt-4 text-green-600">{message}</p>}
            </main>

            {/* Footer */}
            <footer className="py-8 flex justify-center">
                <Link
                    href="/"
                    className="w-[150px] h-[50px] bg-[#1a365d] hover:bg-[#2a4a7d] text-white font-normal flex items-center justify-center"
                    style={{fontFamily: 'Arial', fontSize: '16pt'}}
                >
                    Главная
                </Link>
            </footer>
        </div>
    )
}