import Image from 'next/image'
import Link from 'next/link'
import Header from "@/components/header"

/**
 * Sales Page Component
 * Displays promotional offers and special deals
 * Features:
 * - Gradient text heading
 * - Promotional message
 * - Background image with blur effect
 * - Navigation back to home page
 */
export default function Component() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header - Contains the main navigation and branding */}
            <Header />

            {/* Main Content - Promotional information */}
            <main className="flex-grow flex flex-col items-center">
                {/* Background with plus signs */}
                <div className="relative w-full flex-grow flex flex-col items-center">
                    {/* Blurred background image */}
                    <div
                        className="absolute inset-0 opacity-50 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
                            filter: 'blur(4px)'
                        }}
                    />

                    {/* Content overlay - Main promotional content */}
                    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
                        {/* Multicolored heading with gradient effect */}
                        <h1
                            className="text-4xl md:text-[36pt] font-bold text-center mb-8"
                            style={{ fontFamily: 'Verdana' }}
                        >
                            <span>ЕЩЁ БОЛЬШЕ </span>
                            <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">ПЛЮСОВ</span>
                            <span> С БЕЛТЕЛЕКОМ</span>
                        </h1>

                        {/* Promotional text - Special offer */}
                        <p
                            className="text-[#007bff] text-center text-lg md:text-[18pt] font-bold mt-8"
                            style={{ fontFamily: 'Arial' }}
                        >
                            Подключи оригинальную подписку Яндекс.Плюс БЕСПЛАТНО на 90 дней!
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer - Contains the home page link */}
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