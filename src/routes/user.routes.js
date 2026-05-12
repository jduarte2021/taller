import { Router } from "express";
import { authRequired } from "../middlewares/validateTokens.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createLog } from "../controllers/log.controller.js";

const router = Router();

// Get all users
router.get('/users/all', authRequired, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Update user role (superadmin only)
router.put('/users/:id/role', authRequired, async (req, res) => {
    try {
        const { cargo } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { cargo }, { new: true, select: '-password' });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Update user password (superadmin or admin only)
router.put('/users/:id/password', authRequired, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        const isAdmin = requestingUser?.cargo === "Administrador" || requestingUser?.email?.includes("jimmy.duarte");
        if (!isAdmin) return res.status(403).json({ message: "Sin permisos para cambiar contraseñas" });

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(req.params.id, { password: hash }, { new: true, select: '-password' });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        await createLog('UPDATE_PASSWORD', `Admin ${requestingUser.username} cambió contraseña de ${user.username}`, req.user.id, requestingUser.username, req.ip);
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Delete user (superadmin only)
router.delete('/users/:id', authRequired, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        if (user.email?.includes("jimmy.duarte")) return res.status(403).json({ message: "No se puede eliminar al superadmin" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

export default router;
