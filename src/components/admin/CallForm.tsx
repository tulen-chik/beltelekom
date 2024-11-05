'use client'

import { useState } from 'react'

export default function CallForm() {
    const [userId, setUserId] = useState('')
    const [callDate, setCallDate] = useState('')
    const [callType, setCallType] = useState('local')
    const [serviceName, setServiceName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [code, setCode] = useState('')
    const [minutes, setMinutes] = useState('')
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        try {
            const response = await fetch('/api/admin/calls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId, callDate, callType, serviceName, quantity, code, minutes, amount })
            })

            if (response.ok) {
                setMessage('Звонок успешно добавлен')
                // Сброс формы
                setUserId('')
                setCallDate('')
                setCallType('local')
                setServiceName('')
                setQuantity('')
                setCode('')
                setMinutes('')
                setAmount('')
            } else {
                const data = await response.json()
                setMessage(data.message || 'Произошла ошибка')
            }
        } catch (error) {
            setMessage('Произошла ошибка при отправке данных')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="userId" className="block mb-1">ID пользователя</label>
                <input
                    type="number"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="callDate" className="block mb-1">Дата звонка</label>
                <input
                    type="date"
                    id="callDate"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="callType" className="block mb-1">Тип звонка</label>
                <select
                    id="callType"
                    value={callType}
                    onChange={(e) => setCallType(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="local">Местный</option>
                    <option value="long_distance">Междугородний</option>
                    <option value="international">Международный</option>
                    <option value="wire_service">Проводное вещание</option>
                </select>
            </div>
            <div>
                <label htmlFor="serviceName" className="block mb-1">Название услуги</label>
                <input
                    type="text"
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="quantity" className="block mb-1">Количество</label>
                <input
                    type="text"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="code" className="block mb-1">Код</label>
                <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="minutes" className="block mb-1">Минуты</label>
                <input
                    type="number"
                    id="minutes"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="amount" className="block mb-1">Сумма</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    step="0.01"
                    className="w-full p-2 border rounded"
                />
            </div>
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Добавить звонок
            </button>
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </form>
    )
}