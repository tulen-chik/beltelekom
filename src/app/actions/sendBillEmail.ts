'use server'

// @ts-ignore
import nodemailer from 'nodemailer';

interface BillEmailParams {
    email: string;
    billData: {
        id: string;
        amount: number;
        start_date: string;
        end_date: string;
        created_at: string;
        callsCount: number;
        subscriberName: string;
    };
}

export async function sendBillEmail({ email, billData }: BillEmailParams) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("SMTP credentials are not set in environment variables");
        return { success: false, message: 'Ошибка конфигурации сервера' };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Проверка подключения
    await new Promise((resolve, reject) => {
        // @ts-ignore
        transporter.verify((error, success) => {
            if (error) {
                console.log("Error verifying transporter:", error);
                reject(error);
            } else {
                console.log("Server is ready to take our messages");
                resolve(success);
            }
        });
    });
    console.log(email)
    const mailData = {
        from: `"Телеком компания" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Ваш счет #${billData.id}`,
        text: `Уважаемый ${billData.subscriberName},\n\nВаш счет за период с ${billData.start_date} по ${billData.end_date} готов.\nСумма к оплате: $${billData.amount.toFixed(2)}\n\nС уважением,\nТелеком компания`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Уважаемый ${billData.subscriberName},</h2>
                <p>Ваш счет за период с ${billData.start_date} по ${billData.end_date} готов.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Номер счета:</strong> ${billData.id}</p>
                    <p><strong>Дата создания:</strong> ${billData.created_at}</p>
                    <p><strong>Сумма к оплате:</strong> $${billData.amount.toFixed(2)}</p>
                    <p><strong>Количество звонков:</strong> ${billData.callsCount}</p>
                </div>
                <p style="margin-top: 30px;">С уважением,<br>Телеком компания</p>
            </div>
        `,
    };

    // Отправка письма
    try {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err);
                    reject(err);
                } else {
                    console.log("Message sent: %s", info.messageId);
                    resolve(info);
                }
            });
        });
        return { success: true, message: 'Счет отправлен на email!' };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, message: 'Ошибка при отправке счета на email' };
    }
}