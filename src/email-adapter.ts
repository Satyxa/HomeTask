import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendEmail (email, subject, message, res){
        console.log('into email send')
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 't85819000@gmail.com',
                pass: 'iieasludfwvnlcfv'
            },
        })

        let info = await transporter.sendMail({
            from: 't85819000@gmail.com',
            to: email,
            subject,
            html: message
        })
        return res.status(204)
    },
}