'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import Header from "@/components/header";
const executives = [
    {
        name: 'Ивашкин Алексей Александрович',
        position: 'Генеральный директор',
        image: '/Без названия.jfif'
    },
    {
        name: 'Мельников Геннадий Васильевич',
        position: 'Первый заместитель генерального директора',
        image: '/Без названия (1).jfif'
    },
    {
        name: 'Жаркевич Андрей Ромуальдович',
        position: 'Заместитель генерального директора по техническим вопросам',
        image: '/Без названия (2).jfif'
    },
    {
        name: 'Заливко Андрей Александрович',
        position: 'Заместитель генерального директора по кадрам, безопасности и режиму',
        image: '/Без названия (3).jfif'
    },
    {
        name: 'Буйницкий Сергей Александрович',
        position: 'Заместитель генерального директора по цифровому развитию и информационным технологиям',
        image: '/Без названия (4).jfif'
    }
];

export default function Management() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <Header/>
            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Verdana', fontSize: '24pt' }}>
                    Руководство
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {executives.map((executive, index) => (
                        <div key={index} className="overflow-hidden border rounded-lg shadow-md">
                            <div className="relative h-[400px]">
                                <Image
                                    src={executive.image}
                                    alt={executive.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4 bg-gray-100">
                                <h2 className="text-blue-700 font-semibold text-lg mb-2 font-['Arial']">
                                    {executive.name}
                                </h2>
                                <p className="text-gray-600 text-sm font-['Arial']">
                                    {executive.position}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
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
