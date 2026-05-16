import Log from '../models/log.model.js';

export const getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const logs = await Log.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Log.countDocuments();
        res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo logs" });
    }
};

export const createLog = async (action, description, userId, username, ip = "", meta = {}) => {
    try {
        await Log.create({ action, description, user: userId || null, username: username || "Sistema", ip, meta });
    } catch (e) { /* silent */ }
};

export default { getLogs, createLog };
