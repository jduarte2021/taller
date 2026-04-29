import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import profileRoutes from "./routes/profile.routes.js";
import path from "path";



const app = express()
// Configurar __dirname con ES Modules
const __dirname = path.resolve();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true

}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api",authRoutes);
app.use("/api",taskRoutes);
app.use("/api",profileRoutes);
// Middleware para servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));


export default app;
