"use client"

// Import necessary dependencies
import { useState } from "react"
import { LogOut, Phone, Tag, Users, Clipboard, Gift } from "lucide-react"
import TariffsSection from "./TariffsSection"
import ProfilesSection from "./ProfilesSection"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import BillsSection from "@/components/BillsSection";
import CallsSection from "@/components/CallsSection";
import BonusesSection from "@/components/BonusesSection";

/**
 * AdminPanel Component
 * Main administrative interface component that provides access to different management sections
 * Features:
 * - Navigation between different admin sections
 * - Session management (logout functionality)
 * - Dynamic content rendering based on selected section
 */
export default function AdminPanel() {
    const router = useRouter() // Initialize router for navigation

    // State to track the currently active section
    const [activeSection, setActiveSection] = useState<"calls" | "tariffs" | "profiles" | "bills" | "bonuses">("calls")

    /**
     * Handles user logout by:
     * 1. Removing authentication cookies
     * 2. Redirecting to home page
     */
    const handleLogout = () => {
        Cookies.remove("userRole")
        Cookies.remove("userProfile")
        router.push("/")
    }

    return (
        // Main container with full screen height and gray background
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar navigation panel */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Панель администратора</h1>
                    {/* Navigation menu */}
                    <nav>
                        <ul className="space-y-2">
                            {/* Calls section button */}
                            <li>
                                <button
                                    onClick={() => setActiveSection("calls")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "calls" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Phone className="mr-2"/>
                                    Звонки
                                </button>
                            </li>
                            {/* Tariffs section button */}
                            <li>
                                <button
                                    onClick={() => setActiveSection("tariffs")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "tariffs" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Tag className="mr-2"/>
                                    Тарифы
                                </button>
                            </li>
                            {/* Profiles section button */}
                            <li>
                                <button
                                    onClick={() => setActiveSection("profiles")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "profiles" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Users className="mr-2"/>
                                    Профили
                                </button>
                            </li>
                            {/* Bills section button */}
                            <li>
                                <button
                                    onClick={() => setActiveSection("bills")}
                                    className={`flex items-center w-full p-2 rounded ${activeSection === "bills" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                                >
                                    <Clipboard className="mr-2"/>
                                    Счета
                                </button>
                            </li>
                            {/* Bonuses section button */}
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
                {/* Logout button positioned at the bottom of sidebar */}
                <div className="absolute bottom-4 left-4">
                    <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700">
                        <LogOut className="mr-2"/>
                        Выйти
                    </button>
                </div>
            </div>

            {/* Main content area - dynamically renders the selected section */}
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