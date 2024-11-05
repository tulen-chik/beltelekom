'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './header'
import LogoutButton from './LogoutButton'

interface Call {
    id: number
    callDate: string
    callType: string
    serviceName: string
    quantity: string
    code: string
    minutes: number
    amount: number
}

interface BillingSummary {
    total_charges: number
    previous_balance: number
    payments_received: number
    current_balance: number
}

export default function UserDashboard() {
    const [calls, setCalls] = useState<Call[]>([])
    const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchBillingData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/login')
                    return
                }

                const callsResponse = await fetch('/api/user/calls', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const summaryResponse = await fetch('/api/user/billing', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (!callsResponse.ok || !summaryResponse.ok) {
                    throw new Error('Failed to fetch calls data')
                }

                const callsData = await callsResponse.json()
                const summaryData = await summaryResponse.json()

                setCalls(callsData.calls)
                setBillingSummary(summaryData.billingSummary)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch calls data')
                setLoading(false)
            }
        }

        fetchBillingData()
    }, [router])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    const formatAmount = (amount: number): string => amount.toFixed(2)

    const renderCallsSection = (title: string, filteredCalls: Call[]) => (
        <section className="mb-8">
            <h2 className="font-bold mb-4 bg-gray-200 p-2">{title}</h2>
            <table className="w-full">
                <thead>
                <tr className="border-b">
                    <th className="py-2 text-left">Дата</th>
                    <th className="py-2 text-left">Услуга</th>
                    <th className="py-2 text-right">Количество</th>
                    <th className="py-2 text-right">Код</th>
                    <th className="py-2 text-right">Минуты</th>
                    <th className="py-2 text-right">Сумма</th>
                </tr>
                </thead>
                <tbody>
                {filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b">
                        <td className="py-2">{call.callDate}</td>
                        <td className="py-2">{call.serviceName}</td>
                        <td className="py-2 text-right">{call.quantity}</td>
                        <td className="py-2 text-right">{call.code}</td>
                        <td className="py-2 text-right">{call.minutes}</td>
                        <td className="py-2 text-right">{formatAmount(call.amount)}</td>
                    </tr>
                ))}
                <tr className="bg-gray-100">
                    <td colSpan={5} className="py-2 font-bold">Итого</td>
                    <td className="py-2 text-right font-bold">
                        {formatAmount(filteredCalls.reduce((sum, call) => sum + call.amount, 0))}
                    </td>
                </tr>
                </tbody>
            </table>
        </section>
    )

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Биллинг</h1>
                    <LogoutButton />
                </div>

                {renderCallsSection('Услуги местной телефонной связи', calls.filter(call => call.callType === 'local'))}
                {renderCallsSection('Услуги проводного вещания', calls.filter(call => call.callType === 'wire_service'))}
                {renderCallsSection('Услуги междугородной связи', calls.filter(call => call.callType === 'long_distance'))}
                {renderCallsSection('Услуги международной связи', calls.filter(call => call.callType === 'international'))}

                {billingSummary && (
                    <section className="mb-8">
                        <h2 className="font-bold mb-4 bg-gray-200 p-2">Сводка по счету</h2>
                        <table className="w-full">
                            <tbody>
                            <tr className="border-b">
                                <td className="py-2 font-bold">Итого начислено по счету</td>
                                <td className="py-2 text-right font-bold">{formatAmount(billingSummary.total_charges)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">Задолженность на начало месяца</td>
                                <td className="py-2 text-right">{formatAmount(billingSummary.previous_balance)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">Поступила оплата</td>
                                <td className="py-2 text-right">{formatAmount(billingSummary.payments_received)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-bold">Текущий баланс</td>
                                <td className="py-2 text-right font-bold">{formatAmount(billingSummary.current_balance)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </section>
                )}
            </main>
        </div>
    )
}