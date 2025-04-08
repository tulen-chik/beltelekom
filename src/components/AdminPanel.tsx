"use client"

import { useState } from "react"
import { LogOut, Phone, Tag, Users, Clipboard, Gift } from "lucide-react"
import TariffsSection from "./TariffsSection"
import ProfilesSection from "./ProfilesSection"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import BillsSection from "@/components/BillsSection";
import CallsSection from "@/components/CallsSection";
import BonusesSection from "@/components/BonusesSection";

export default function AdminPanel() {
    const router = useRouter() // Инициализируем router

    const [activeSection, setActiveSection] = useState<"calls" | "tariffs" | "profiles" | "bills" | "bonuses">("calls")

    // Выход из системы
    const handleLogout = () => {
        Cookies.remove("userRole")
        Cookies.remove("userProfile")
        router.push("/") // Используем router для перенаправления
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Боковая панель */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Панель администратора</h1>
                    <nav>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setActiveSection("calls")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "calls" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Phone className="mr-2"/>
                                    Звонки
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection("tariffs")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "tariffs" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Tag className="mr-2"/>
                                    Тарифы
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection("profiles")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "profiles" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Users className="mr-2"/>
                                    Профили
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection("bills")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "bills" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Clipboard className="mr-2"/>
                                    Счета
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection("bonuses")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "bonuses" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Gift className="mr-2"/>
                                    Бонусы
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="absolute bottom-4 left-4">
                    <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700">
                        <LogOut className="mr-2"/>
                        Выйти
                    </button>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeSection === "calls" && <CallsSection/>}
                {activeSection === "tariffs" && <TariffsSection />}
                {activeSection === "profiles" && <ProfilesSection />}
                {activeSection === "bills" && <BillsSection />}
                {activeSection === "bonuses" && <BonusesSection />}
            </div>
        </div>
    )
}