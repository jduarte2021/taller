import { Router } from "express";
import { authRequired } from "../middlewares/validateTokens.js";
import User from "../models/user.model.js";

const router = Router();

// Get all users with full info (superadmin only)
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

export default router;

// Delete user (superadmin only)
router.delete('/users/:id', authRequired, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        // Prevent deleting superadmin
        if (user.email?.includes("jimmy.duarte")) return res.status(403).json({ message: "No se puede eliminar al superadmin" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});
