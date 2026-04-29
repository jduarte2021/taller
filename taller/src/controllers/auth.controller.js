import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {createAccessToken} from '../libs/jwt.js'
import jwt from 'jsonwebtoken';
import {TOKEN_SECRET} from '../config.js'

export const register = async (req,res) => {
    const {email, password, username, nombres, apellidos, cargo } = req.body

try {

    const userFound = await User.findOne({email})
    if (userFound) return res.status(400).json(["El correo ya está registrado"]);
    if (!cargo) {
        return res.status(400).json({ message: "El campo 'cargo' es obligatorio." });
    }

    const passwordHash = await bcrypt.hash(password, 10)


    const newUser = new User({
        username,
        email,
        password: passwordHash,
        nombres,
        apellidos,
        cargo
    })
    // Guardar usuario en la base de datos
    const userSaved = await newUser.save()
    // Crear un token JWT
    const token = await createAccessToken({id: userSaved._id})
    // Guardar el token en una cookie y enviar respuesta
    res.cookie('token', token);
    res.json({
        id: userSaved._id,
        username: userSaved.username,
        nombres: userSaved.nombres,
        apellidos: userSaved.apellidos,
        cargo: userSaved.cargo,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        updatedAt: userSaved.updatedAt,
    })
} catch (error) {
  res.status(500).json({message: error.message});
}
    
};

export const login = async (req,res) => {
    const {email,password} = req.body

try {
    // Buscar usuario
    const userFound = await User.findOne({email})
    if (!userFound) return res.status(400).json({message: "Usuario no encontrado"});
    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({message: "Datos Incorrectos"});
    // Generar token
    const token = await createAccessToken({id: userFound._id});

    res.cookie('token', token);
    res.json({
        id: userFound._id,
        username: userFound.username,
        nombres: userFound.nombres,
        apellidos: userFound.apellidos,
        cargo: userFound.cargo,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
    })
} catch (error) {
  res.status(500).json({message: error.message});
}
    
};

export const logout = (req, res) => {
    res.cookie('token', "",{
        expires: new Date(0)
    })
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id)

    if (!userFound) return res.status(400).json({ message: "Usuario no encontrado"});

    return res.json({
        id: userFound._id,
        username: userFound.username,
        nombres: userFound.nombres,
        apellidos: userFound.apellidos,
        cargo: userFound.cargo,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
    })
}

// Esta funcion es para verificar que el usuario esta logueado y 
// puede acceder a las rutas protegidas.

export const verifyToken = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) return res.status(401).json({ message: "No autorizado" });

        jwt.verify(token, TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(401).json({ message: "Token inválido" });

            const userFound = await User.findById(user.id);

            if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

            // Devolver los campos esperados
            return res.json({
                id: userFound._id,
                nombres: userFound.nombres,
                apellidos: userFound.apellidos,
                cargo: userFound.cargo,
                email: userFound.email,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "username email"); // Solo devolver username y email
        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};