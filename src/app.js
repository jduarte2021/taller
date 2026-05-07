import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

const allowedOrigins = [
  'http://localhost:5173',
  'https://taller-ten-amber.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado'));
    }
  },
  credentials: true
}));

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP'
});

app.use(limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
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


// Middleware global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});
