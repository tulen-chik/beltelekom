import Image from 'next/image'
import Link from 'next/link'
import Header from "@/components/header";

export default function Component() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <Header/>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1
                    className="text-blue-600 text-center mb-12"
                    style={{ fontFamily: 'Verdana', fontSize: '24pt' }}
                >
                    Бренд-портфель компании
                </h1>

                {/* byfly Section */}
                <section className="mb-12">
                    <p
                        className="text-black"
                        style={{ fontFamily: 'Arial', fontSize: '14pt' }}
                    >
                        Бренд-портфель компании складывается из бренда «Белтелеком», которым представлена голосовая связь, передача данных, хостинг и ряд других услуг, а также брендов byfly (высокоскоростной доступ в Интернет), ZALA (интерактивное, эфирное и Интернет-телевидение), ЯСНА (пакеты услуг) «ЯСНА» TV.
                    </p>
                </section>

                {/* ZALA Section */}
                <section className="mb-12">
                    <div className="flex mb-4">
                        <Image
                            src="/images.png"
                            alt="ЯСНА"
                            width={150}
                            height={75}
                            className="object-contain"
                        />
                    </div>
                    <p
                        className="text-black"
                        style={{fontFamily: 'Arial', fontSize: '14pt'}}
                    >
                        ZALA - это бренд, объединяющий интерактивное, эфирное и интернет-телевидение от РУП «Белтелеком». Интерактивное ТВ позволяет управлять телеканалами - ставить на паузу, просматривать передачи, ранее вышедшие в эфир, знакомиться с программой и многое другое. Эфирное телевидение дает возможность смотреть телеканалы в цифровом качестве там, где раньше это было технически невозможно. А со SMART ZALA любимые программы доступны везде, где есть Интернет. Цифровое качество, широкий выбор каналов, наличие тематических пакетов разных жанров определили успех ZALA среди телезрителей.
                    </p>
                </section>

                {/* ЯСНА Section */}
                <section className="mb-12">
                    <div className="flex mb-4">
                        <Image
                            src="/logo-e.png"
                            alt="ЯСНА"
                            width={150}
                            height={75}
                            className="object-contain"
                        />
                    </div>
                    <p
                        className="text-black"
                        style={{ fontFamily: 'Arial', fontSize: '14pt' }}
                    >
                        ЯСНА - это бренд, в рамках которого абонентам предложены различные наборы из нескольких услуг, необходимые современному человеку для комфорта и полноценного общения. В рамках бренда физическим лицам оказываются наиболее востребованные услуги на базе сети абонентского доступа по технологии GPON (пассивные оптические сети). С использованием данной технологии абонентам доступны подключение к сети Интернет на скорости до 500 Мбит/с, современные услуги телевидения и другие сервисы, требующие высокой пропускной способности.
                    </p>
                </section>
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