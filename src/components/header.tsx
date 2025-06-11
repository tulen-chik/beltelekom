import Image from 'next/image'
import { Phone } from 'lucide-react'
import Link from "next/link";

/**
 * Header Component
 * Displays the main header of the application with company logo and contact information
 * Contains:
 * - Company logo (left side)
 * - Customer service phone number
 * - Secondary logo (right side)
 */
export default function Header() {
    return (
        // Main header container with white background and bottom border
        <header className="w-full bg-white border-b p-4 flex justify-between items-center">
            {/* Left section containing logo and phone number */}
            <div className="flex items-center gap-2">
                {/* Company logo with link to home page */}
                <Link href="/">
                    <Image
                        src="/logo-beltelekom.png"
                        alt="Белтелеком"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </Link>

                {/* Customer service phone number display */}
                <div className="flex items-center text-white bg-[#1a365d] px-3 py-2 rounded">
                    <Phone className="w-5 h-5 mr-2"/>
                    <span className="font-arial text-xs">
                        Телефонный центр обслуживания клиентов 123
                    </span>
                </div>
            </div>
            {/* Secondary company logo on the right side */}
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