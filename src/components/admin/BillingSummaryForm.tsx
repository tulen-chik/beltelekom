'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface BillingSummaryFormData {
    userId: string
    month: string
    totalCharges: string
    previousBalance: string
    paymentsReceived: string
    currentBalance: string
}

export default function BillingSummaryForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<BillingSummaryFormData>()

    async function onSubmit(values: BillingSummaryFormData) {
        setIsSubmitting(true)
        setMessage('')
        try {
            const response = await fetch('/api/admin/billing-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    userId: parseInt(values.userId),
                    month: values.month,
                    totalCharges: parseFloat(values.totalCharges),
                    previousBalance: parseFloat(values.previousBalance),
                    paymentsReceived: parseFloat(values.paymentsReceived),
                    currentBalance: parseFloat(values.currentBalance),
                }),
            })

            if (!response.ok) {
                throw new Error('Ошибка при отправке данных')
            }

            setMessage('Сводка по счету успешно добавлена/обновлена')
            reset()
        } catch (error) {
            setMessage('Не удалось добавить/обновить сводку по счету')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    ID пользователя
                </label>
                <input
                    type="number"
                    id="userId"
                    {...register('userId', { required: 'ID пользователя обязателен' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.userId && (
                    <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                    Месяц
                </label>
                <input
                    type="text"
                    id="month"
                    {...register('month', { required: 'Месяц обязателен' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Например: Май 2024"
                />
                {errors.month && (
                    <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="totalCharges" className="block text-sm font-medium text-gray-700">
                    Общая сумма начислений
                </label>
                <input
                    type="number"
                    id="totalCharges"
                    {...register('totalCharges', {
                        required: 'Общая сумма начислений обязательна',
                        min: { value: 0, message: 'Сумма должна быть положительной' }
                    })}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.totalCharges && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalCharges.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="previousBalance" className="block text-sm font-medium text-gray-700">
                    Предыдущий баланс
                </label>
                <input
                    type="number"
                    id="previousBalance"
                    {...register('previousBalance', { required: 'Предыдущий баланс обязателен' })}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.previousBalance && (
                    <p className="mt-1 text-sm text-red-600">{errors.previousBalance.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="paymentsReceived" className="block text-sm font-medium text-gray-700">
                    Полученные платежи
                </label>
                <input
                    type="number"
                    id="paymentsReceived"
                    {...register('paymentsReceived', {
                        required: 'Полученные платежи обязательны',
                        min: { value: 0, message: 'Сумма должна быть положительной' }
                    })}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.paymentsReceived && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentsReceived.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700">
                    Текущий баланс
                </label>
                <input
                    type="number"
                    id="currentBalance"
                    {...register('currentBalance', { required: 'Текущий баланс обязателен' })}
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.currentBalance && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentBalance.message}</p>
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