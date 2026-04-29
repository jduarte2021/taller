import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    nombres: {                
        type: String,
        required: true,
        trim: true
    },
    apellidos: {              
        type: String,
        required: true,
        trim: true
    },
    cargo: {               
        type: String,
        required: true,     
        trim: true
    },
    profileImage: { // Campo para almacenar la ruta de la imagen
        type: String,
        default: "" // Valor por defecto en caso de no existir una imagen
    }
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);
