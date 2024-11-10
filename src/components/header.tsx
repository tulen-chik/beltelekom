import Image from 'next/image'
import { Phone } from 'lucide-react'
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full bg-white border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <Image
                        src="/logo-beltelekom.png"
                        alt="Белтелеком"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </Link>

                <div className="flex items-center text-white bg-[#1a365d] px-3 py-2 rounded">
                    <Phone className="w-5 h-5 mr-2"/>
                    <span className="font-arial text-xs">
              Телефонный центр обслуживания клиентов 123
            </span>
                </div>
            </div>
            <Image
                src="/Beltelecom_logo.png"
                alt="Белтелеком"
                width={100}
                height={100}
                className="object-contain"
            />
        </header>
    )
}