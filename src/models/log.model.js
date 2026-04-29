import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    action: { type: String, required: true },      // CREATE_TASK, DELETE_TASK, LOGIN, etc.
    description: { type: String, required: true }, // Descripción legible
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, default: "Sistema" },
    ip: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // datos extra
}, { timestamps: true });

export default mongoose.model('Log', logSchema);
