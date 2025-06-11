import Image from 'next/image'
import Link from 'next/link'

/**
 * Main Page Component
 * The landing page of the application that provides navigation to different sections
 * Features:
 * - Responsive design with mobile and desktop layouts
 * - Background map overlay for visual appeal
 * - Welcome message and main title
 * - Navigation grid with links to different sections
 */
export default function Component() {
  return (
      <div className="min-h-screen flex flex-col bg-[#1a365d] relative overflow-hidden">
        {/* Background Map Overlay - Creates a semi-transparent map background */}
        <div
            className="absolute inset-0 opacity-70 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url('/cfc5ca50003ae5464466cc3cb095b135.jpg')`,
              filter: 'brightness(0.7)'
            }}
        />

        {/* Header Section - Contains the main title and welcome message */}
        <header className="relative z-10 bg-[#1a365d] p-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-[36pt] font-bold text-white mb-2" style={{ fontFamily: 'Verdana' }}>
              РАСЧЕТ УСЛУГ СВЯЗИ.
            </h1>
            <p className="text-lg md:text-[18pt] text-white" style={{ fontFamily: 'Arial' }}>
              Добро пожаловать на наш сайт! Мы предлагаем удобный и быстрый расчет услуг связи
            </p>
          </div>
        </header>

        {/* Main Content Section - Currently empty, can be used for additional content */}
        <main className="flex-grow relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center">

        </main>

        {/* Navigation Section - Contains links to different sections of the website */}
        <nav className="relative z-10 w-full mt-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px">
            {/* Navigation links array - Maps through the array to create navigation buttons */}
            {[
                {title: 'О компании', href: "about"}, // About company section
                {title: 'Бренд-портфель', href: "brand"}, // Brand portfolio section
                {title: 'Авторизация', href: "user"}, // User authentication section
                {title: 'Пакеты услуг эл/связи', href: "package"}, // Service packages section
                {title: 'Акции', href: "sales"}, // Promotions section
            ].map((text) => (
                <Link
                    key={text.title}
                    href={text.href}
                    className="bg-[#1a365d] hover:bg-[#2a4a7d] text-white font-normal flex items-center justify-center h-[50px]"
                    style={{ fontFamily: 'Arial', fontSize: '16pt' }}
                >
                  {text.title}
                </Link>
            ))}
          </div>
        </nav>
      </div>
  )
}