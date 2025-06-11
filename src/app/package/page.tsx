import Image from 'next/image';
import Link from 'next/link';
import Header from "@/components/header";

/**
 * Package Page Component
 * Displays information about service packages and their conditions
 * Features:
 * - List of connection conditions
 * - Current service package rates
 * - Link to detailed instructions
 * - Navigation back to home page
 */
export default function Component() {
    // Array of connection conditions for service packages
    const conditions = [
        "подключение к пакетам услуг подразумевает подключение и оплату всех услуг, включенных в пакет;",
        "при подключении к пакету услуг, абоненту предоставляется необходимое оборудование;",
        "оплатить пакеты услуг можно любым из перечисленных здесь способов;",
        "подключиться к пакetam услуг, в которые включены услуги телефонной связи, могут только те Абоненты, на которых оформлен абонемент на право пользования абонентским номером местной телефонной сети (то есть те, на кого зарегистрирован телефон);",
        "подключение пакетов услуг предоставляет при наличии технической возможности;",
        "пакеты «Экспресс» и «Супер экспресс» доступны только абонентам сети доступа GPON;",
        "пакет «Универсал» не предоставляется абонентам сети IMS;",
        "при неоплате (частичной оплате) стоимости пакета, доступ к услугам, включенным в пакет, временно прекращается. Поэтому гарантией бесперебойного оказания услуг в составе пакета является своевременная оплата.",
        "Подключение новых абонентов на пакеты услуг электросвязи \"Оптимум плюс\", \"Универсал\" и \"Экспресс лайт\" не производится с 10 октября 2016 года.",
        "при оказании услуг междугородной связи в составе пакета, помимо междугородных минут расходуется такое же количество минут местной связи, в том числе из количества, включенного в пакет."
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header - Contains the main navigation and branding */}
            <Header />

            {/* Main Content - Service package information */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Page title */}
                <h1 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Verdana', fontSize: '24pt' }}>
                    Пакеты услуг от Белтелеком
                </h1>

                <div className="space-y-4 text-black" style={{ fontFamily: 'Arial' }}>
                    {/* Connection conditions section */}
                    <h2 className="text-xl font-semibold mb-6">
                        Условия подключения:
                    </h2>
                    <ul className="list-disc pl-6 space-y-1">
                        {conditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                        ))}
                    </ul>

                    {/* Current rates section */}
                    <h3 className="text-base font-semibold mt-4">
                        Ведомость с 16 апреля 2024 года
                    </h3>

                    {/* Rates table */}
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="w-20 font-['Arial'] text-xs">№ п/п</th>
                                <th className="font-['Arial'] text-xs">Наименование</th>
                                <th className="text-right font-['Arial'] text-xs">
                                    Тарифы с учетом налога на добавленную стоимость, белорусских рублей
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr className="border-b border-gray-200">
                                <td className="font-['Arial'] text-xs">1</td>
                                <td className="font-['Arial'] text-xs">
                                    «Супер экспресс» (круглосуточный доступ в сеть Интернет без учета трафика на
                                    скорости прием/передача до 15/7,5 Мбит/сек и услуги интерактивного телевидения),
                                    в месяц
                                </td>
                                <td className="text-right font-['Arial'] text-xs">34.60</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Instructions link */}
                    <div className="mt-6">
                        <Link href="/instruction" className="font-['Arial'] text-xs underline">
                            Инструкция о порядке установления и применения тарифов на пакеты услуг электросвязи для
                            физических лиц
                        </Link>
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
    );
}
