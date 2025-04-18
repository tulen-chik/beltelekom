export type Rate = number | null;

interface RawMetaData {
    address: string;
    full_name: string;
    phone_number: string;
    email: string;
}

export interface Subscriber {
    subscriber_id: string;
    money: number;
    category: '0.5' | '1'; // Значения из столбца category
    role: 'admin' | 'user'; // Значения из столбца role
    subscriber_id_substring: string; // Подстрока subscriber_id
    raw_user_meta_data: RawMetaData | undefined;
}

export interface Call {
    id: string; // BIGINT, но хранится как строка
    call_date: string; // DATE в формате YYYY-MM-DD
    start_time: string; // TIME в формате HH:MM:SS
    duration: number; // Продолжительность в секундах или минутах
    zone_code: string; // Код зоны для тарифа
    subscriber_id: string; // UUID абонента, ссылается на subscribers_profiles
}

export interface Tariff {
    zone_code: string; // Код зоны
    name: string; // Название тарифа
    start_date: string; // Дата начала действия тарифа
    day_rate_start: number | null; // Дневной тариф (может быть null)
    night_rate_start: number | null; // Ночной тариф (может быть null)
    end_date: string; // Дата окончания действия тарифа
    day_rate_end: number | null; // Дневной тариф на конец периода (может быть null)
    night_rate_end: number | null; // Ночной тариф на конец периода (может быть null)
}

export interface BillDetail {
    date: string; // Дата билла
    time: string; // Время билла
    duration: number; // Продолжительность в секундах или минутах
    cost: number; // Стоимость
    tariffName: string;
}

export interface Bill {
    id: string
    subscriber_id: string
    start_date: string
    end_date: string
    amount: number
    details: {
        calls: {
            id: number
            duration: number
            call_date: string
            zone_code: string
            start_time: string
        }[]
    }
    created_at: string
    subscriberName: string
    subscriberAddress: string
}