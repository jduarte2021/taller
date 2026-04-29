import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    orderNumber: { type: Number, unique: true, required: true },
    description: { type: String, required: true },
    motivoIngreso: { type: String, default: "" },         // Motivo de Ingreso
    diagnosticoTaller: { type: String, default: "" },     // Diagnóstico Taller
    repairDescription: { type: String, required: true },  // Descripción reparación/cambio piezas
    date: { type: Date, default: Date.now },
    clientNombres: { type: String, required: true },
    clientApellidos: { type: String, required: true },
    clientRUT: { type: String, required: true },
    clientPhone: { type: String, required: true },
    clientEmail: { type: String, required: true },
    carPlate: { type: String, required: true, trim: true, uppercase: true },
    carBrand: { type: String, required: true },
    carModel: { type: String, required: true },
    carColor: { type: String, required: true },
    carYear: { type: String, default: "" },               // Año
    carKm: { type: String, default: "" },                 // Kilometraje
    carDamages: { type: String, default: "" },            // Daños visibles
    carDetails: { type: String, default: "" },            // Detalles extraordinarios
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ['en curso', 'completada'], default: 'en curso' },
    servicePrice: { type: Number, required: true, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
