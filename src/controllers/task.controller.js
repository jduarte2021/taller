import Task from '../models/task.model.js'
import User from '../models/user.model.js'
import mongoose from 'mongoose';
import archiver from 'archiver';
import { createLog } from './log.controller.js';

export const searchTasksByCarPlate = async (req, res) => {
    try {
        const { carPlate } = req.query;
        if (!carPlate) return res.status(400).json({ message: "Debe proporcionar una patente válida" });
        const tasks = await Task.find({ carPlate: { $regex: `^${carPlate.trim().toUpperCase()}$`, $options: "i" } })
            .populate('assignedTo', 'nombres apellidos').populate('createdBy', 'username').populate('editedBy', 'username');
        if (tasks.length === 0) return res.status(404).json({ message: "No se encontraron tareas con esa patente" });
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const searchTasksByClientName = async (req, res) => {
    const { clientName } = req.query;
    try {
        if (!clientName?.trim()) return res.status(400).json({ message: "El parámetro 'clientName' es requerido." });
        const tasks = await Task.find({ $or: [ { clientNombres: new RegExp(clientName, "i") }, { clientApellidos: new RegExp(clientName, "i") } ] })
            .populate('assignedTo', 'nombres apellidos').populate('createdBy', 'username');
        if (tasks.length === 0) return res.status(404).json({ message: "No se encontraron tareas para el cliente especificado." });
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const searchTasksByPhone = async (req, res) => {
    const { phone } = req.query;
    try {
        if (!phone?.trim()) return res.status(400).json({ message: "El parámetro 'phone' es requerido." });
        const tasks = await Task.find({ clientPhone: new RegExp(phone.trim(), "i") })
            .populate('assignedTo', 'nombres apellidos').populate('createdBy', 'username');
        if (tasks.length === 0) return res.status(404).json({ message: "No se encontraron tareas para ese teléfono." });
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const searchTasksByOrderNumber = async (req, res) => {
    const { orderNumber } = req.query;
    try {
        if (!orderNumber?.trim()) return res.status(400).json({ message: "El parámetro 'orderNumber' es requerido." });
        const num = parseInt(orderNumber.trim());
        if (isNaN(num)) return res.status(400).json({ message: "El número de orden debe ser un número válido." });
        const tasks = await Task.find({ orderNumber: num })
            .populate('assignedTo', 'nombres apellidos').populate('createdBy', 'username').populate('editedBy', 'username');
        if (tasks.length === 0) return res.status(404).json({ message: "No se encontró ninguna orden con ese número." });
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'nombres apellidos')
            .populate('createdBy', 'username')
            .populate('editedBy', 'username');
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const createTask = async (req, res) => {
    try {
        const lastTask = await Task.findOne().sort({ orderNumber: -1 });
        const newOrderNumber = lastTask?.orderNumber ? lastTask.orderNumber + 1 : 1001;
        const newTask = new Task({ ...req.body, user: req.user.id, createdBy: req.user.id, orderNumber: newOrderNumber });
        const savedTask = await newTask.save();
        const populatedTask = await Task.findById(savedTask._id).populate("assignedTo", "nombres apellidos").populate("createdBy", "username");
        const u = await User.findById(req.user.id);
        await createLog('CREATE_TASK', `Orden #${newOrderNumber} creada para cliente ${req.body.clientNombres} ${req.body.clientApellidos}`, req.user.id, u?.username, req.ip, { orderNumber: newOrderNumber });
        res.status(201).json(populatedTask);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor: " + error.message }); }
};

export const getTask = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
    try {
        const task = await Task.findById(id).populate('createdBy', 'username').populate('editedBy', 'username').populate('assignedTo', 'nombres apellidos');
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        res.json(task);
    } catch (error) { res.status(500).json({ message: 'Error interno del servidor' }); }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
    try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        const u = await User.findById(req.user.id);
        await createLog('DELETE_TASK', `Orden #${task.orderNumber} eliminada (cliente: ${task.clientNombres} ${task.clientApellidos})`, req.user.id, u?.username, req.ip, { orderNumber: task.orderNumber });
        res.sendStatus(204);
    } catch (error) { res.status(500).json({ message: 'Error interno del servidor' }); }
};

export const updateTask = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
    try {
        const task = await Task.findByIdAndUpdate(id, { ...req.body, editedBy: req.user.id }, { new: true, runValidators: true })
            .populate('assignedTo', 'nombres apellidos').populate('createdBy', 'username').populate('editedBy', 'username');
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        const u = await User.findById(req.user.id);
        await createLog('UPDATE_TASK', `Orden #${task.orderNumber} editada (cliente: ${task.clientNombres} ${task.clientApellidos})`, req.user.id, u?.username, req.ip, { orderNumber: task.orderNumber });
        res.json(task);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

export const markTaskAsCompleted = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findByIdAndUpdate(id, { status: 'completada' }, { new: true });
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        const u = await User.findById(req.user.id);
        await createLog('COMPLETE_TASK', `Orden #${task.orderNumber} marcada como completada`, req.user.id, u?.username, req.ip);
        res.json(task);
    } catch (error) { res.status(500).json({ message: 'Error interno del servidor' }); }
};

export const backupTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo','nombres apellidos').populate('createdBy','username').populate('editedBy','username');
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=respaldo_ordenes_${date}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        archive.append(JSON.stringify(tasks, null, 2), { name: `ordenes_${date}.json` });
        const csvHeader = 'N° Orden,Cliente,RUT,Teléfono,Email,Patente,Marca,Modelo,Color,Año,KM,Estado,Precio,Mecánico,Fecha\n';
        const csvRows = tasks.map(t => `${t.orderNumber},"${t.clientName}","${t.clientRUT}","${t.clientPhone}","${t.clientEmail}","${t.carPlate}","${t.carBrand}","${t.carModel}","${t.carColor}","${t.carYear||''}","${t.carKm||''}","${t.status}",${t.servicePrice},"${t.assignedTo?t.assignedTo.nombres+' '+t.assignedTo.apellidos:'N/A'}","${new Date(t.date).toLocaleDateString('es-CL')}"`).join('\n');
        archive.append(csvHeader + csvRows, { name: `ordenes_${date}.csv` });
        const u = await User.findById(req.user.id);
        await createLog('BACKUP', `Respaldo de órdenes generado`, req.user.id, u?.username, req.ip);
        await archive.finalize();
    } catch (error) { res.status(500).json({ message: "Error generando respaldo" }); }
};
