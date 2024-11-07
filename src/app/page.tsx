import Image from 'next/image'
import Link from 'next/link'

export default function Component() {
  return (
      <div className="min-h-screen flex flex-col bg-[#1a365d] relative overflow-hidden">
        {/* Background Map Overlay */}
        <div
            className="absolute inset-0 opacity-70 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url('/cfc5ca50003ae5464466cc3cb095b135.jpg')`,
              filter: 'brightness(0.7)'
            }}
        />

        {/* Header */}
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

        {/* Main Content */}
        <main className="flex-grow relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center">

        </main>

        {/* Navigation Buttons */}
        <nav className="relative z-10 w-full mt-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px">
            {[
                {title: 'О компании', href: "about"},
                {title: 'Бренд-портфель', href: "brand"},
                {title: 'Авторизация', href: "user"},
                {title: 'Пакеты услуг эл/связи', href: "package"},
                {title: 'Акции', href: "sales"},
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