import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {createAccessToken} from '../libs/jwt.js'
import jwt from 'jsonwebtoken';
import {TOKEN_SECRET} from '../config.js'
import { createLog } from './log.controller.js';

export const register = async (req, res) => {
    const {email, password, username, nombres, apellidos, cargo } = req.body
    try {
        const userFound = await User.findOne({email})
        if (userFound) return res.status(400).json(["El correo ya está registrado"]);
        if (!cargo) return res.status(400).json({ message: "El campo 'cargo' es obligatorio." });
        const passwordHash = await bcrypt.hash(password, 10)
        const newUser = new User({ username, email, password: passwordHash, nombres, apellidos, cargo })
        const userSaved = await newUser.save()
        const token = await createAccessToken({id: userSaved._id})
        res.cookie('token', token);
        await createLog('REGISTER', `Nuevo usuario registrado: ${username} (${email})`, userSaved._id, username, req.ip);
        res.json({ id: userSaved._id, username: userSaved.username, nombres: userSaved.nombres, apellidos: userSaved.apellidos, cargo: userSaved.cargo, email: userSaved.email })
    } catch (error) { res.status(500).json({message: error.message}); }
};

export const login = async (req, res) => {
    const {email, password} = req.body
    try {
        const userFound = await User.findOne({email})
        if (!userFound) return res.status(400).json({message: "Usuario no encontrado"});
        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({message: "Datos Incorrectos"});
        const token = await createAccessToken({id: userFound._id});
        res.cookie('token', token);
        await createLog('LOGIN', `Usuario ${userFound.username} inició sesión`, userFound._id, userFound.username, req.ip);
        res.json({ id: userFound._id, username: userFound.username, nombres: userFound.nombres, apellidos: userFound.apellidos, cargo: userFound.cargo, email: userFound.email, profileImage: userFound.profileImage })
    } catch (error) { res.status(500).json({message: error.message}); }
};

export const logout = (req, res) => {
    res.cookie('token', "", { expires: new Date(0) })
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id)
    if (!userFound) return res.status(400).json({ message: "Usuario no encontrado"});
    return res.json({ id: userFound._id, username: userFound.username, nombres: userFound.nombres, apellidos: userFound.apellidos, cargo: userFound.cargo, email: userFound.email, profileImage: userFound.profileImage })
};

export const verifyToken = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "No autorizado" });
        jwt.verify(token, TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(401).json({ message: "Token inválido" });
            const userFound = await User.findById(user.id);
            if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });
            return res.json({ id: userFound._id, username: userFound.username, nombres: userFound.nombres, apellidos: userFound.apellidos, cargo: userFound.cargo, email: userFound.email, profileImage: userFound.profileImage });
        });
    } catch (error) { return res.status(500).json({ message: "Error interno del servidor" }); }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "username email nombres apellidos cargo");
        res.json(users);
    } catch (error) { res.status(500).json({ message: "Error interno del servidor" }); }
};

// Register by admin (no token cookie, just response)
export const registerByAdmin = async (req, res) => {
    const {email, password, username, nombres, apellidos, cargo } = req.body
    try {
        const userFound = await User.findOne({email})
        if (userFound) return res.status(400).json({ message: "El correo ya está registrado" });
        const passwordHash = await bcrypt.hash(password, 10)
        const newUser = new User({ username, email, password: passwordHash, nombres, apellidos, cargo: cargo || "Mecánico" })
        const userSaved = await newUser.save()
        const adminUser = await User.findById(req.user.id);
        await createLog('ADMIN_REGISTER', `Admin ${adminUser?.username} registró usuario: ${username} (${email}) con cargo ${cargo}`, req.user.id, adminUser?.username, req.ip);
        res.json({ id: userSaved._id, username: userSaved.username, nombres: userSaved.nombres, apellidos: userSaved.apellidos, cargo: userSaved.cargo, email: userSaved.email })
    } catch (error) { res.status(500).json({message: error.message}); }
};
