import express from "express";
import { authRequired } from "../middlewares/validateTokens.js";
import User from "../models/user.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createLog } from "../controllers/log.controller.js";

const router = express.Router();

// Crear carpeta uploads si no existe
const uploadsDir = path.resolve("src/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Carpeta src/uploads creada automáticamente");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.user.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
              && allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Solo se permiten imágenes (jpg, png, gif, webp)"));
  },
});

router.put("/profile", authRequired, upload.single("profileImage"), async (req, res) => {
  try {
    const { id } = req.user;
    const { nombre, apellido, cargo } = req.body;

    const currentUser = await User.findById(id);
    if (!currentUser) return res.status(404).json({ message: "Usuario no encontrado" });

    const updatedFields = {
      nombres: nombre?.trim() || currentUser.nombres,
      apellidos: apellido?.trim() || currentUser.apellidos,
      cargo: cargo?.trim() || currentUser.cargo,
    };

    if (req.file) {
      updatedFields.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true, runValidators: false }
    );

    await createLog(
      "UPDATE_PROFILE",
      `Usuario ${currentUser.username} actualizó su perfil${req.file ? " (foto)" : ""}`,
      id,
      currentUser.username,
      req.ip
    );

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      nombres: updatedUser.nombres,
      apellidos: updatedUser.apellidos,
      cargo: updatedUser.cargo,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil: " + error.message });
  }
});

export default router;
