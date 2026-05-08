import mongoose from "mongoose";


// Eliminar modelo existente del caché
if (mongoose.models.Task) {
    delete mongoose.models.Task;
}


const taskSchema = new mongoose.Schema({
    orderNumber: {
        type: Number,
        unique: true, // Garantiza que sea único
        required: true,
    },
    
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    clientName: {
        type: String,
        required: true,
    },
    clientRUT: {
        type: String,
        required: true,
    },
    clientPhone: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
    },
    carPlate: {
        type: String,
        required: true,
        trim: true, // Elimina espacios adicionales
        uppercase: true // Convierte siempre a mayúsculas
    },
    carBrand: {
        type: String,
        required: true,
    },
    carModel: {
        type: String,
        required: true,
    },
    carColor: {
        type: String,
        required: true,
    },
    carDetails: {
        type: String,
        required: true,
    },
    repairDescription: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ['en curso', 'completada'],
        default: 'en curso',
    },

    servicePrice: {
        type: Number,
        required: true,
        min: 0, // Asegura que no haya valores negativos
    },

    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    editedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    
}, { timestamps: true }); // createdAt y updatedAt automáticos

export default mongoose.model('Task', taskSchema);