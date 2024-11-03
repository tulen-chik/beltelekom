import Link from 'next/link'
import Header from "@/components/header"

export default function Component() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Terms and Conditions List */}
                <div className="space-y-4 mb-8" style={{ fontFamily: 'Arial' }}>
                    <p>Пакеты услуг от Белтелеком предоставляются на следующих условиях:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>подключение к пакетам услуг подразумевает подключение и оплату всех услуг, включенных в пакет;</li>
                        <li>при подключении к пакету услуг, абоненту предоставляется необходимое оборудование;</li>
                        <li>оплатить пакеты услуг можно любым из перечисленных здесь способов;</li>
                        <li>подключиться к пакетам услуг, в который включены услуги телефонной связи, могут только те Абоненты, на которых оформлен абонемент на право пользования абонентским номером местной телефонной сети (то есть те, на кого зарегистрирован телефон);</li>
                        <li>подключение пакетов услуг предоставляет при наличии технической возможности;</li>
                        <li>пакеты «Экспресс» и «Супер экспресс» доступны только абонентам сети доступа GPON;</li>
                        <li>пакет «Универсал» не предоставляется абонентам сети IMS;</li>
                        <li>при неоплате (или не полной оплате) стоимости пакета, доступ к услугам, включенным в пакет, временно прекращается. Поэтому гарантией бесперебойного оказания услуг в составе пакета является своевременная оплата.</li>
                        <li>Подключение новых абонентов на пакеты услуг электросвязи "Оптимум плюс", "Универсал" и "Экспресс лайт" не производится с 10 октября 2016 года.</li>
                        <li>при оказании услуг междугородной связи в составе пакета, помимо междугородных минут расходуется такое же количество минут местной связи, в том числе из количества, включенного в пакет.</li>
                    </ul>
                </div>

                {/* Tariffs Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Arial' }}>
                        Тарифы на пакеты услуг для физических лиц:
                    </h2>
                    <p className="text-gray-700 mb-4" style={{ fontFamily: 'Arial' }}>
                        В соответствии с действующим законодательством тарифы установлены с налогом на добавленную стоимость.
                    </p>
                    <p className="text-gray-600 mb-6" style={{ fontFamily: 'Arial' }}>
                        Вводятся с 16 апреля 2024 года
                    </p>

                    {/* Tariffs Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-200 p-3 text-left">№ п/п</th>
                                <th className="border border-gray-200 p-3 text-left">Наименование</th>
                                <th className="border border-gray-200 p-3 text-left">Тарифы с учетом налога на добавленную стоимость, белорусских рублей</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="border border-gray-200 p-3">1</td>
                                <td className="border border-gray-200 p-3">«Супер экспресс» (круглосуточный доступ в сеть Интернет без учета трафика на скорости прием/передача до 15/7,5 Мбит/сек и услуги интерактивного телевидения), в месяц</td>
                                <td className="border border-gray-200 p-3">34.60</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <Link
                        href="#"
                        className="text-blue-600 hover:underline"
                        style={{ fontFamily: 'Arial' }}
                    >
                        Инструкция о порядке установления и применения тарифов на пакеты услуг электросвязи для физических лиц
                    </Link>
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