import { Router } from "express";
import { authRequired } from "../middlewares/validateTokens.js";
import nodemailer from "nodemailer";
import { createLog } from "../controllers/log.controller.js";
import User from "../models/user.model.js";

const router = Router();

router.post('/email/send', authRequired, async (req, res) => {
    const { to, subject, message } = req.body;
    if (!to || !message) return res.status(400).json({ message: "Faltan campos requeridos" });

    // Configurar transporter — usa variables de entorno para SMTP
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"TallerData" <${process.env.SMTP_USER}>`,
            to,
            subject: subject || "Contacto desde TallerData",
            text: message,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #38bdf8;">
                    <div><strong style="font-size:18px;color:#0f172a;">TallerData</strong><br><span style="font-size:12px;color:#64748b;">Software para Taller Mecánico</span></div>
                </div>
                <p style="color:#0f172a;line-height:1.6;">${message.replace(/\n/g,'<br>')}</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                <p style="font-size:11px;color:#94a3b8;">Este correo fue enviado desde el sistema TallerData.</p>
            </div>`,
        });
        const u = await User.findById(req.user.id);
        await createLog('SEND_EMAIL', `Email enviado a ${to}`, req.user.id, u?.username, req.ip, { to, subject });
        res.json({ message: "Correo enviado correctamente" });
    } catch (error) {
        console.error("Error enviando email:", error.message);
        res.status(500).json({ message: "Error al enviar correo: " + error.message });
    }
});

export default router;
