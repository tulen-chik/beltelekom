import { useState, useEffect } from 'react'
import Header from "@/components/header"
import Link from "next/link"
import axios from 'axios'

interface Service {
    service_name: string
    quantity: string
    amount: number
}

interface CallRecord {
    date: string
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
    const [localServices, setLocalServices] = useState<Service[]>([])
    const [wireServices, setWireServices] = useState<Service[]>([])
    const [longDistanceCalls, setLongDistanceCalls] = useState<CallRecord[]>([])
    const [internationalCalls, setInternationalCalls] = useState<CallRecord[]>([])
    const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchBillingStatement = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get('/api/user/billing', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setLocalServices(response.data.localServices)
                setWireServices(response.data.wireServices)
                setLongDistanceCalls(response.data.longDistanceCalls)
                setInternationalCalls(response.data.internationalCalls)
                setBillingSummary(response.data.billingSummary)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch billing statement')
                setLoading(false)
            }
        }

        fetchBillingStatement()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Local Telephone Services */}
                <section className="mb-8">
                    <h2 className="font-bold mb-4 bg-gray-200 p-2">Услуги местной телефонной связи</h2>
                    <table className="w-full">
                        <tbody>
                        {localServices.map((service, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2">август</td>
                                <td className="py-2">{service.service_name}</td>
                                <td className="py-2 text-right">{service.quantity}</td>
                                <td className="py-2 text-right">{service.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100">
                            <td colSpan={3} className="py-2 font-bold">Итого Услуги местной телефонной связи</td>
                            <td className="py-2 text-right font-bold">
                                {localServices.reduce((sum, service) => sum + service.amount, 0).toFixed(2)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* Wire Services */}
                <section className="mb-8">
                    <h2 className="font-bold mb-4 bg-gray-200 p-2">Услуги проводного вещания</h2>
                    <table className="w-full">
                        <tbody>
                        {wireServices.map((service, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2">август</td>
                                <td className="py-2">{service.service_name}</td>
                                <td className="py-2 text-right">{service.quantity}</td>
                                <td className="py-2 text-right">{service.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100">
                            <td colSpan={3} className="py-2 font-bold">Итого Услуги проводного вещания</td>
                            <td className="py-2 text-right font-bold">
                                {wireServices.reduce((sum, service) => sum + service.amount, 0).toFixed(2)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* Long Distance Calls */}
                <section className="mb-8">
                    <h2 className="font-bold mb-4 bg-gray-200 p-2">Услуги междугородной связи</h2>
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2 text-left">Дата</th>
                            <th className="py-2 text-left">Код</th>
                            <th className="py-2 text-right">Минут</th>
                            <th className="py-2 text-right">Сумма</th>
                        </tr>
                        </thead>
                        <tbody>
                        {longDistanceCalls.map((call, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2">{new Date(call.date).toLocaleDateString()}</td>
                                <td className="py-2">{call.code}</td>
                                <td className="py-2 text-right">{call.minutes}</td>
                                <td className="py-2 text-right">{call.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100">
                            <td colSpan={3} className="py-2 font-bold">Итого Услуги междугородной связи</td>
                            <td className="py-2 text-right font-bold">
                                {longDistanceCalls.reduce((sum, call) => sum + call.amount, 0).toFixed(2)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* International Calls */}
                <section className="mb-8">
                    <h2 className="font-bold mb-4 bg-gray-200 p-2">Услуги международной связи</h2>
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2 text-left">Дата</th>
                            <th className="py-2 text-left">Код</th>
                            <th className="py-2 text-right">Минут</th>
                            <th className="py-2 text-right">Сумма</th>
                        </tr>
                        </thead>
                        <tbody>
                        {internationalCalls.map((call, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2">{new Date(call.date).toLocaleDateString()}</td>
                                <td className="py-2">{call.code}</td>
                                <td className="py-2 text-right">{call.minutes}</td>
                                <td className="py-2 text-right">{call.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100">
                            <td colSpan={3} className="py-2 font-bold">Итого Услуги международной связи</td>
                            <td className="py-2 text-right font-bold">
                                {internationalCalls.reduce((sum, call) => sum + call.amount, 0).toFixed(2)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* Summary */}
                {billingSummary && (
                    <section className="mb-8">
                        <table className="w-full">
                            <tbody>
                            <tr className="border-b">
                                <td className="py-2 font-bold">Итого начислено по счету</td>
                                <td className="py-2 text-right font-bold">{billingSummary.total_charges.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">Задолженность на начало месяца</td>
                                <td className="py-2 text-right">{billingSummary.previous_balance.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2">Поступила оплата</td>
                                <td className="py-2 text-right">{billingSummary.payments_received.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-bold">Текущий баланс</td>
                                <td className="py-2 text-right font-bold">{billingSummary.current_balance.toFixed(2)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 flex justify-center">
                <Link
                    href="/"
                    className="w-[150px] h-[50px] bg-[#1a365d] hover:bg-[#2a4a7d] text-white font-normal flex items-center justify-center"
                    style={{ fontFamily: 'Arial', fontSize: '16pt' }}
                >
                    Главная
                </Link>
            </footer>
        </div>
    )
}