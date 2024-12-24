'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Subscriber } from '@/types'

export default function BillingForm() {
    const [subscriberNumber, setSubscriberNumber] = useState('')
    const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubscriberSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubscriber(null)
        try {
            const { data, error } = await supabase
                .from('subscribers')
                .select('*')
                .eq('subscriber_number', subscriberNumber)
                .single()

            if (error) throw error

            if (data) {
                setSubscriber(data)
            } else {
                setError('Абонент не найден')
            }
        } catch (err) {
            setError('Ошибка при поиске абонента')
        }
    }

    const handleBillingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            const response = await fetch('/api/admin/generate-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriberNumber,
                    startDate,
                    endDate,
                }),
            })
            if (response.ok) {
                const data = await response.json()
                setSuccess(`Счет успешно сформирован и сохранен в файл: ${data.fileName}`)
            } else {
                setError('Ошибка при формировании счета')
            }
        } catch (err) {
            setError('Ошибка при формировании счета')
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubscriberSearch} className="space-y-4">
                <div>
                    <label htmlFor="subscriberNumber" className="block text-sm font-medium text-gray-700">
                        Номер АБН
                    </label>
                    <input
                        type="text"
                        id="subscriberNumber"
                        value={subscriberNumber}
                        onChange={(e) => setSubscriberNumber(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Найти абонента
                </button>
            </form>

            {error && <div className="text-red-500">{error}</div>}

            {subscriber && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Информация об абоненте</h3>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">ФИО</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{subscriber.full_name}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Адрес</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{subscriber.address}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Признак льготности</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {subscriber.category === '0.5' ? 'Льготный (0.5)' : 'Обычный (1)'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}

            {subscriber && (
                <form onSubmit={handleBillingSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            Начало периода
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            Конец периода
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Сформировать счет
                    </button>
                </form>
            )}

            {success && <div className="text-green-500">{success}</div>}
        </div>
    )
}