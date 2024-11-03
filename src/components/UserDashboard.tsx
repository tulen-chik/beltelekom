import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserDashboard() {
    const [debt, setDebt] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDebt = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/user/debt', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDebt(response.data.debt);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch debt information');
                setLoading(false);
            }
        };

        fetchDebt();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
            <p className="text-lg">Your current debt: {debt} BYN</p>
        </div>
    );
}