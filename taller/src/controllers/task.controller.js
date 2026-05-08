import Task from '../models/task.model.js'
import mongoose from 'mongoose';



// Buscar tareas por patente de cliente
export const searchTasksByCarPlate = async (req, res) => {
    try {
        const { carPlate } = req.query;

        if (!carPlate) {
            return res.status(400).json({ message: "Debe proporcionar una patente válida" });
        }

        // Normalizar la patente
        const normalizedCarPlate = carPlate.trim().toUpperCase();

        // Buscar tareas que coincidan exactamente con la patente (insensible a mayúsculas/minúsculas)
        const tasks = await Task.find({
            carPlate: { $regex: `^${normalizedCarPlate}$`, $options: "i" }
        });

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No se encontraron tareas con esa patente" });
        }

        res.json(tasks);
    } catch (error) {
        console.error("Error al buscar tareas por patente:", error.message);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Buscar tareas por nombre de cliente
export const searchTasksByClientName = async (req, res) => {
    const { clientName } = req.query;

    try {
        if (!clientName || clientName.trim() === "") {
            return res.status(400).json({ message: "El parámetro 'clientName' es requerido." });
        }

        const query = { clientName: new RegExp(clientName, "i") }; // Búsqueda insensible a mayúsculas
        const tasks = await Task.find(query);

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No se encontraron tareas para el cliente especificado." });
        }

        res.json(tasks);
    } catch (error) {
        console.error("Error al buscar tareas por nombre:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'nombres apellidos')// Muestra el nombre del mecanico asignado
            .populate('createdBy', 'username') // Muestra el nombre del creador
            .populate('editedBy', 'username'); // Muestra el nombre del editor

        res.json(tasks);
    } catch (error) {
        console.error("Error al obtener las tareas:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};




export const createTask = async (req, res) => {
    try {
        const lastTask = await Task.findOne().sort({ orderNumber: -1 });
        const newOrderNumber = lastTask && typeof lastTask.orderNumber === 'number'
            ? lastTask.orderNumber + 1
            : 1;

        const {
            description,
            date,
            clientName,
            clientRUT,
            clientPhone,
            clientEmail,
            carPlate,
            carBrand,
            carModel,
            carColor,
            carDetails,
            repairDescription,
            servicePrice,
            assignedTo, // Nuevo campo
        } = req.body;

        // Validar el usuario asignado (opcional)
        if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
            return res.status(400).json({ message: "ID del usuario asignado no es válido" });
        }

        const newTask = new Task({
            description,
            date,
            clientName,
            clientRUT,
            clientPhone,
            clientEmail,
            carPlate,
            carBrand,
            carModel,
            carColor,
            carDetails,
            repairDescription,
            servicePrice,
            user: req.user.id, // ID del usuario autenticado
            createdBy: req.user.id,
            orderNumber: newOrderNumber,
            assignedTo: assignedTo || null, // Si no se asigna, será null
        });

        const savedTask = await newTask.save();

        // Poblar el usuario asignado en la respuesta
        const populatedTask = await Task.findById(savedTask._id)
            .populate("assignedTo", "username email") // Poblar el usuario asignado
            .populate("createdBy", "username"); // Poblar el creador

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error("Error al crear la tarea:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};




export const getTask = async (req, res) => {
    const { id } = req.params;

    // Validar si el `id` es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid task ID' });
    }

    try {
        const task = await Task.findById(id)
            .populate('createdBy', 'username') // Muestra el nombre de usuario del creador
            .populate('editedBy', 'username');
        // Muestra el nombre de usuario del editor

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


export const deleteTask = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid task ID' });
    }

    try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateTask = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid task ID' });
    }

    try {
        // Añadir el ID del usuario autenticado al campo `editedBy`
        const updateData = { ...req.body, editedBy: req.user.id };

        const task = await Task.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate('assignedTo', 'nombres apellidos')
            .populate('createdBy', 'username') // Populate para mostrar el creador
            .populate('editedBy', 'username'); // Populate para mostrar el editor

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(task);
    } catch (error) {
        console.error("Error al actualizar la tarea:", error.message);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};




export const markTaskAsCompleted = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByIdAndUpdate(
            id,
            { status: 'completada' },
            { new: true } // Devuelve la tarea actualizada
        );

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
