import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    orderNumber:       { type: Number, unique: true, required: true },
    // Solo estos 3 son obligatorios en el formulario
    clientNombres:     { type: String, required: true },
    clientApellidos:   { type: String, required: true },
    carPlate:          { type: String, required: true, trim: true, uppercase: true },
    // Todo lo demás es opcional
    description:       { type: String, default: "" },
    motivoIngreso:     { type: String, default: "" },
    diagnosticoTaller: { type: String, default: "" },
    repairDescription: { type: String, default: "" },
    date:              { type: Date, default: Date.now },
    clientRUT:         { type: String, default: "" },
    clientPhone:       { type: String, default: "" },
    clientEmail:       { type: String, default: "" },
    carBrand:          { type: String, default: "" },
    carModel:          { type: String, default: "" },
    carColor:          { type: String, default: "" },
    carYear:           { type: String, default: "" },
    carKm:             { type: String, default: "" },
    carDamages:        { type: String, default: "" },
    carDetails:        { type: String, default: "" },
    servicePrice:      { type: Number, default: 0, min: 0 },
    status:            { type: String, enum: ['en curso', 'completada'], default: 'en curso' },
    user:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    editedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedTo:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
