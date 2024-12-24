'use client'

import Header from '@/components/header'
import LogoutButton from '@/components/LogoutButton'
import BillingForm from '@/components/admin/BillingSummaryForm'

export default function AdminDashboard() {

    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Панель администратора</h1>
                    <LogoutButton/>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Формирование счета</h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Введите номер абонента и период для формирования счета
                        </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <BillingForm/>
                    </div>
                </div>
            </main>
        </div>
    )
}