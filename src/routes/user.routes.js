import { Router } from "express";
import { authRequired, superadminRequired } from "../middlewares/validateTokens.js";
import User from "../models/user.model.js";

const router = Router();

// Listar todos los usuarios con info completa (superadmin only)
router.get('/users/all', authRequired, superadminRequired, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Cambiar rol de usuario (superadmin only)
router.put('/users/:id/role', authRequired, superadminRequired, async (req, res) => {
    try {
        const { cargo } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { cargo },
            { new: true, select: '-password' }
        );
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Eliminar usuario (superadmin only)
router.delete('/users/:id', authRequired, superadminRequired, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        if (user.email?.includes("jimmy.duarte"))
            return res.status(403).json({ message: "No se puede eliminar al superadmin" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

export default router;
