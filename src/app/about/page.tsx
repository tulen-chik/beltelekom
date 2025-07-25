import Image from 'next/image'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import Header from "@/components/header";

/**
 * About Page Component
 * Displays information about the company and its structure
 * Features:
 * - Company overview and history
 * - List of branches and productions
 * - Navigation to management and cooperation pages
 * - Responsive design with consistent styling
 */
export default function Component() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header - Contains the main navigation and branding */}
            <Header/>

            {/* Navigation Buttons - Links to management and cooperation pages */}
            <nav className="w-full grid grid-cols-2 gap-px">
                {[
                    {name: 'Руководство', href: "/about/management"}, // Management page link
                    {name: 'Сотрудничество', href: "/about/help"} // Cooperation page link
                ].map((text) => (
                    <Link
                        key={text.name}
                        href={text.href}
                        className="bg-[#1a365d] hover:bg-[#2a4a7d] text-white font-normal flex items-center justify-center h-[50px]"
                        style={{ fontFamily: 'Arial', fontSize: '16pt' }}
                    >
                        {text.name}
                    </Link>
                ))}
            </nav>

            {/* Main Content - Company information and structure */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Page title */}
                <h1 className="text-2xl font-bold mb-6 text-black" style={{ fontFamily: 'Verdana', fontSize: '24pt' }}>
                    О компании
                </h1>

                {/* Company description and information */}
                <div className="space-y-4 text-black" style={{ fontFamily: 'Arial' }}>
                    {/* Company overview */}
                    <p>
                        Республиканское унитарное предприятие электросвязи «Белтелеком» - ведущая телекоммуникационная компания с многолетней историей, персонал которой обеспечивает и реализует важные для государства, общества, частных и корпоративных клиентов телекоммуникационные решения и занимает лидирующую позицию на активную политику расширения и улучшения услуг электросвязи. В своей деятельности предприятие делает ставку на телекоммуникационном рынке Республики Беларусь, являясь крупнейшим оператором электросвязи на территории нашей страны.
                    </p>

                    {/* Company history */}
                    <p>
                        Белтелеком был создан 3 июля 1995 года как Республиканское государственное объединение. 1 августа 2004 года компания преобразована в Республиканское унитарное предприятие электросвязи. Областные унитарные предприятия электросвязи, а также Минская городская телефонная сеть, УП «Междугородная связь», УП «Минская телефонно-телеграфная станция» реорганизованы в филиалы РУП «Белтелеком» путем присоединения.
                    </p>

                    {/* Current structure */}
                    <p>
                        Сегодня компания «Белтелеком» включает в себя 9 филиалов и 3 производства в составе головного структурного подразделения
                    </p>

                    {/* List of branches */}
                    <div className="mt-6">
                        <h2 className="font-bold mb-2">Список филиалов:</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Брестский филиал</li>
                            <li>Витебский филиал</li>
                            <li>Гомельский филиал</li>
                            <li>Гродненский филиал</li>
                            <li>Могилевский филиал</li>
                            <li>Минский филиал</li>
                            <li>Филиал «Минская городская телефонная сеть»</li>
                            <li>Филиал «Радио, телевидение и связь»</li>
                            <li>Филиал «Подсобное сельское хозяйство»</li>
                        </ul>
                    </div>

                    {/* List of productions */}
                    <div className="mt-6">
                        <h2 className="font-bold mb-2">Список производств:</h2>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Международный центр консультации</li>
                            <li>Информационно-расчетный центр</li>
                            <li>Производство Минская телефонно-телеграфная станция</li>
                        </ul>
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