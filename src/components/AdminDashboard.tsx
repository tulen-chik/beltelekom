'use client'

import { useState } from 'react'
import Header from '@/components/header'
import LogoutButton from '@/components/LogoutButton'
import CallForm from '@/components/admin/CallForm'
import BillingSummaryForm from '@/components/admin/BillingSummaryForm'

export default function AdminDashboard() {
    const [activeForm, setActiveForm] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Панель администратора</h1>
                    <LogoutButton />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setActiveForm('calls')}
                        className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Добавить звонок/услугу
                    </button>
                    <button
                        onClick={() => setActiveForm('billingSummary')}
                        className="p-4 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Сводка по счетам
                    </button>
                </div>

                {activeForm === 'calls' && <CallForm />}
                {activeForm === 'billingSummary' && <BillingSummaryForm />}
            </main>
        </div>
    )
}