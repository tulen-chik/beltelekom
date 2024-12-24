import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    const { subscriberNumber, startDate, endDate } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    try {
        // Get subscriber information
        const { data: subscriber, error: subscriberError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('subscriber_number', subscriberNumber)
            .single()

        if (subscriberError) throw subscriberError
        if (!subscriber) {
            return NextResponse.json({ error: 'Абонент не найден' }, { status: 404 })
        }

        // Get calls for the period
        const { data: calls, error: callsError } = await supabase
            .from('calls')
            .select('*')
            .eq('subscriber_number', subscriberNumber)
            .gte('call_date', startDate)
            .lte('call_date', endDate)

        if (callsError) throw callsError

        // Get applicable tariffs
        const { data: tariffs, error: tariffsError } = await supabase
            .from('tariffs')
            .select('*')
            .lte('start_date', endDate)
            .gte('end_date', startDate)

        if (tariffsError) throw tariffsError

        // Calculate bill
        let totalCost = 0
        const billDetails = calls.map(call => {
            const tariff = tariffs.find(t => t.zone_code === call.zone_code)
            if (!tariff) {
                throw new Error(`Тариф не найден для зоны ${call.zone_code}`)
            }

            const callTime = new Date(`2000-01-01T${call.start_time}`)
            const hour = callTime.getHours()
            const isNightTime = hour >= 23 || hour < 6

            const rate = isNightTime ? tariff.night_rate_start : tariff.day_rate_start
            const cost = rate * call.duration * (subscriber.category === '0.5' ? 0.5 : 1)
            totalCost += cost

            return {
                date: call.call_date,
                time: call.start_time,
                duration: call.duration,
                zone: tariff.name,
                cost: cost.toFixed(2)
            }
        })

        // Generate bill content
        const billContent = `
Счет для абонента: ${subscriber.full_name}
Номер АБН: ${subscriberNumber}
Адрес: ${subscriber.address}
Период: с ${startDate} по ${endDate}

Детализация звонков:
${billDetails.map(detail =>
            `${detail.date} ${detail.time} - ${detail.zone} - ${detail.duration} мин - ${detail.cost} руб.`
        ).join('\n')}

Общая стоимость: ${totalCost.toFixed(2)} руб.
    `.trim()

        // Save bill to file
        const fileName = `bill_${subscriberNumber}_${startDate}_${endDate}.txt`
        const filePath = path.join(process.cwd(), 'public', 'bills', fileName)
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, billContent)

        return NextResponse.json({ success: true, fileName })
    } catch (error) {
        console.error('Error generating bill:', error)
        return NextResponse.json({ error: 'Ошибка при формировании счета' }, { status: 500 })
    }
}