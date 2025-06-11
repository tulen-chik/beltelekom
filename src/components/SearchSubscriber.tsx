"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import type { Subscriber } from "../types/index"
import { supabase } from "@/lib/supabase"

/**
 * Props interface for SearchSubscriber component
 * @property onSelect - Callback function when a subscriber is selected
 * @property setLoading - Function to update loading state
 * @property setError - Function to update error state
 */
interface SearchSubscriberProps {
    onSelect: (subscriber: Subscriber) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
}

/**
 * SearchSubscriber Component
 * A component that allows users to search for subscribers by their ID
 * Features:
 * - Search input field
 * - Real-time search results
 * - Error handling
 * - Loading state management
 */
export default function SearchSubscriber({ onSelect, setLoading, setError }: SearchSubscriberProps) {
    // State management for search term and results
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [searchResults, setSearchResults] = useState<Subscriber[]>([])

    /**
     * Handles the search operation
     * Queries the Supabase database for subscribers matching the search term
     */
    const handleSearch = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from("subscribers_profiles")
                .select("*")
                .ilike("subscriber_id_substring", `%${searchTerm}%`)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error("Ошибка поиска абонентов:", error)
            setError("Не удалось найти абонентов. Пожалуйста, попробуйте снова.")
        } finally {
            setLoading(false)
        }
    }

    return (
        // Main container with white background and shadow
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Поиск абонента</h2>
            {/* Search input and button container */}
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Введите полный или частичный ID абонента"
                    className="border rounded-l p-2 flex-grow"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors"
                >
                    <Search className="h-5 w-5" />
                </button>
            </div>
            {/* Search results list */}
            {searchResults.length > 0 && (
                <ul className="mt-2 border rounded divide-y">
                    {searchResults.map((result) => (
                        <li
                            key={result.subscriber_id}
                            onClick={() => onSelect(result)}
                            className="cursor-pointer hover:bg-gray-100 p-2 transition-colors"
                        >
                            ID абонента: {result.raw_user_meta_data?.phone_number}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}