import express from "express";
import { authRequired } from "../middlewares/validateTokens.js"; // Middleware de autenticación
import User from "../models/user.model.js"; // Modelo del usuario
import multer from "multer"; //Para subir archivos

const router = express.Router();

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/uploads"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});

const upload = multer({ storage });

// Ruta para actualizar el perfil con imagen
router.put("/profile", authRequired, upload.single("profileImage"), async (req, res) => {
  try {
    const { id } = req.user; // ID del usuario autenticado
    const { nombre, apellido, cargo } = req.body;

    const updatedFields = {
      nombres: nombre,
      apellidos: apellido,
      cargo: cargo,
    };

    // Verifica si hay una imagen subida
    if (req.file) {
      updatedFields.profileImage = req.file.filename; // Guarda solo el nombre del archivo
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

    res.json(updatedUser); // Envía la información actualizada
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
});


export default router;