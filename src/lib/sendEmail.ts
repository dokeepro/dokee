import nodemailer from "nodemailer";

export interface MailAttachment {
    filename: string;
    content: Buffer;
}

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments: MailAttachment[] = [],
    html = "",
): Promise<void> {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "dokee.pro@gmail.com",
            pass: "cgrr mobx igcg fkbh",
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    try {
        await transporter.sendMail({
            from: "dokee.pro@gmail.com",
            to,
            subject,
            text,
            html,
            attachments,
        });
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}
