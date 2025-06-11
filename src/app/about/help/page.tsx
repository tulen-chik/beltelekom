'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import Header from "@/components/header";

/**
 * Help Page Component
 * Displays information about international cooperation and partnerships
 * Features:
 * - Overview of international activities
 * - List of cooperation areas
 * - Information about partner organizations
 * - Navigation back to home page
 */
export default function Help() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header - Contains the main navigation and branding */}
            <Header/>

            {/* Main Content - International cooperation information */}
            <main className="container mx-auto px-4 py-8">
                {/* Page title with blue background */}
                <div className="bg-blue-600 text-white p-4 text-xl font-bold">
                    Международное сотрудничество
                </div>

                {/* Content section with company information */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4 text-black font-['Arial']">
                        {/* Company's international cooperation principles */}
                        <p>
                            Международная деятельность РУП «Белтелеком» строится на принципах партнерства и
                            взаимовыгодного сотрудничества со всеми международными организациями, операторами,
                            компаниями с учетом общегосударственных интересов Республики Беларусь.
                        </p>

                        {/* Company's international strategy */}
                        <p>
                            Основной стратегией компании «Белтелеком» в вопросах международной деятельности является
                            обеспечение единой внешнеэкономической политики, осуществление комплекса мероприятий по
                            организации и развитию международной деятельности предприятия, взаимовыгодного
                            сотрудничества с зарубежными странами, а также создание благоприятных условий для внедрения
                            новых телекоммуникационных технологий и услуг, формирование положительного имиджа
                            предприятия.
                        </p>

                        {/* Areas of international cooperation */}
                        <div>
                            <h2 className="font-bold mb-2">Направления международного сотрудничества:</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>сотрудничество с международными организациями связи;</li>
                                <li>участие в международных телекоммуникационных проектах;</li>
                                <li>двухстороннее сотрудничество с зарубежными операторами и компаниями,
                                    предоставляющими услуги связи, а также компаниями и фирмами, производящими
                                    телекоммуникационное оборудование.
                                </li>
                            </ul>
                        </div>

                        {/* Partner organizations */}
                        <p>
                            «Белтелеком» активно сотрудничает с такими международными организациями, как Международный
                            союз электросвязи (МСЭ), Региональное содружество в области связи (РСС), Европейское
                            совещание по планированию сети (ENPM), Европейская организация спутниковой связи «Евтелсат»,
                            и др.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer - Contains the home page link */}
            <footer className="py-8 flex justify-center">
                <Link
                    href="/"
                    className="w-[150px] h-[50px] bg-[#1a365d] hover:bg-[#2a4a7d] text-white font-normal flex items-center justify-center"
                    style={{fontFamily: 'Arial', fontSize: '16pt'}}
                >
                    Главная
                </Link>
            </footer>
        </div>
    )
}
