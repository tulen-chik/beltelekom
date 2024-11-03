import { useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [userId, setUserId] = useState('');
    const [date, setDate] = useState('');
    const [code, setCode] = useState('');
    const [duration, setDuration] = useState('');
    const [amount, setAmount] = useState('');
    const [callType, setCallType] = useState('local');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/add-call', {
                userId,
                date,
                code,
                duration: parseInt(duration),
                amount: parseFloat(amount),
                callType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Call added successfully');
        } catch (error) {
            setMessage('Failed to add call');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="userId" className="block">User ID:</label>
                    <input
                        type="number"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="date" className="block">Date:</label>
                    <input
                        type="datetime-local"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="code" className="block">Code:</label>
                    <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block">Duration (minutes):</label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="amount" className="block">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="callType" className="block">Call Type:</label>
                    <select
                        id="callType"
                        value={callType}
                        onChange={(e) => setCallType(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="local">Local</option>
                        <option value="long_distance">Long Distance</option>
                        <option value="international">International</option>
                    </select>
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Add Call
                </button>
            </form>
            {message && <p className="mt-4 text-green-600">{message}</p>}
        </div>
    );
}