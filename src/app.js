import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from "path";

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import profileRoutes from "./routes/profile.routes.js";
import userRoutes from "./routes/user.routes.js";
import logRoutes from "./routes/log.routes.js";
import emailRoutes from "./routes/email.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();
const __dirname = path.resolve();

// Orígenes permitidos: producción + previews de Vercel + desarrollo local
const allowedOrigins = [
    'https://taller-ten-amber.vercel.app',
    /^https:\/\/taller-.*\.vercel\.app$/,   // cualquier preview de Vercel del proyecto
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir sin origin (curl, Postman, mobile)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        if (allowed) return callback(null, true);
        callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", profileRoutes);
app.use("/api", userRoutes);
app.use("/api", logRoutes);
app.use("/api", emailRoutes);
app.use("/api", pdfRoutes);
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

export default app;
