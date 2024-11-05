'use client'

import { useState } from 'react'

interface BillingSummaryFormData {
    userId: string
    month: string
    totalCharges: string
    previousBalance: string
    paymentsReceived: string
    currentBalance: string
}

export default function BillingSummaryForm() {
    const [formData, setFormData] = useState<BillingSummaryFormData>({
        userId: '',
        month: '',
        totalCharges: '',
        previousBalance: '',
        paymentsReceived: '',
        currentBalance: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof BillingSummaryFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof BillingSummaryFormData, string>> = {};
        if (!formData.userId) newErrors.userId = 'ID пользователя обязателен';
        if (!formData.month) newErrors.month = 'Месяц обязателен';
        if (!formData.totalCharges) newErrors.totalCharges = 'Общая сумма начислений обязательна';
        else if (parseFloat(formData.totalCharges) < 0) newErrors.totalCharges = 'Сумма должна быть положительной';
        if (!formData.previousBalance) newErrors.previousBalance = 'Предыдущий баланс обязателен';
        if (!formData.paymentsReceived) newErrors.paymentsReceived = 'Полученные платежи обязательны';
        else if (parseFloat(formData.paymentsReceived) < 0) newErrors.paymentsReceived = 'Сумма должна быть положительной';
        if (!formData.currentBalance) newErrors.currentBalance = 'Текущий баланс обязателен';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setErrors({});

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/billing-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    userId: parseInt(formData.userId),
                    month: formData.month,
                    totalCharges: parseFloat(formData.totalCharges),
                    previousBalance: parseFloat(formData.previousBalance),
                    paymentsReceived: parseFloat(formData.paymentsReceived),
                    currentBalance: parseFloat(formData.currentBalance),
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке данных');
            }

            setMessage('Сводка по счету успешно добавлена/обновлена');
            setFormData({
                userId: '',
                month: '',
                totalCharges: '',
                previousBalance: '',
                paymentsReceived: '',
                currentBalance: '',
            });
        } catch (error) {
            setMessage('Не удалось добавить/обновить сводку по счету');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    ID пользователя
                </label>
                <input
                    type="number"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.userId && (
                    <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
                )}
            </div>

            <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                    Месяц
                </label>
                <input
                    type="text"
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Например: Май 2024"
                />
                {errors.month && (
                    <p className="mt-1 text-sm text-red-600">{errors.month}</p>
                )}
            </div>

            <div>
                <label htmlFor="totalCharges" className="block text-sm font-medium text-gray-700">
                    Общая сумма начислений
                </label>
                <input
                    type="number"
                    id="totalCharges"
                    name="totalCharges"
                    value={formData.totalCharges}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.totalCharges && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalCharges}</p>
                )}
            </div>

            <div>
                <label htmlFor="previousBalance" className="block text-sm font-medium text-gray-700">
                    Предыдущий баланс
                </label>
                <input
                    type="number"
                    id="previousBalance"
                    name="previousBalance"
                    value={formData.previousBalance}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.previousBalance && (
                    <p className="mt-1 text-sm text-red-600">{errors.previousBalance}</p>
                )}
            </div>

            <div>
                <label htmlFor="paymentsReceived" className="block text-sm font-medium text-gray-700">
                    Полученные платежи
                </label>
                <input
                    type="number"
                    id="paymentsReceived"
                    name="paymentsReceived"
                    value={formData.paymentsReceived}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.paymentsReceived && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentsReceived}</p>
                )}
            </div>

            <div>
                <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700">
                    Текущий баланс
                </label>
                <input
                    type="number"
                    id="currentBalance"
                    name="currentBalance"
                    value={formData.currentBalance}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.currentBalance && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentBalance}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>

            {message && (
                <p className={`mt-4 text-sm ${message.includes('успешно') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}