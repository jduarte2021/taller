/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   SEED - TallerData  |  Datos de prueba para MongoDB    ║
 * ║   Contraseña de todos los usuarios: Admin1234           ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * USO:
 *   1. Asegúrate de tener MongoDB corriendo (mongod)
 *   2. Instala dependencias:  npm install mongoose bcryptjs
 *   3. Ejecuta:               node seed.js
 *
 * Crea la base de datos "taller" con colecciones users y tasks.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Conexión ─────────────────────────────────────────────────────────────────
const MONGO_URI = "mongodb://localhost:27017/taller";

// ── Schemas (mirror exacto de los modelos del proyecto) ───────────────────────
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, trim: true },
  password:     { type: String, required: true },
  nombres:      { type: String, required: true, trim: true },
  apellidos:    { type: String, required: true, trim: true },
  cargo:        { type: String, required: true, trim: true },
  profileImage: { type: String, default: "" },
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  orderNumber:       { type: Number, unique: true, required: true },
  description:       { type: String, required: true },
  date:              { type: Date, default: Date.now },
  clientNombres:     { type: String, required: true },
    clientApellidos:   { type: String, required: true },
  clientRUT:         { type: String, required: true },
  clientPhone:       { type: String, required: true },
  clientEmail:       { type: String, required: true },
  carPlate:          { type: String, required: true, trim: true, uppercase: true },
  carBrand:          { type: String, required: true },
  carModel:          { type: String, required: true },
  carColor:          { type: String, required: true },
  carDetails:        { type: String, required: true },
  repairDescription: { type: String, required: true },
  user:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status:            { type: String, enum: ["en curso", "completada"], default: "en curso" },
  servicePrice:      { type: Number, required: true, min: 0 },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  editedBy:          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedTo:        { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB");

  // Limpiar colecciones anteriores
  await User.deleteMany({});
  await Task.deleteMany({});
  console.log("🗑  Colecciones limpiadas");

  const passwordHash = await bcrypt.hash("Admin1234", 10);

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    {
      username: "jduarte",
      email: "jimmy.duarte@tallerdata.cl",
      password: passwordHash,
      nombres: "Jimmy",
      apellidos: "Duarte",
      cargo: "Administrador",
      profileImage: "",
    },
    {
      username: "cmorales",
      email: "carlos.morales@tallerdata.cl",
      password: passwordHash,
      nombres: "Carlos",
      apellidos: "Morales",
      cargo: "Mecánico Senior",
      profileImage: "",
    },
    {
      username: "lsoto",
      email: "lucia.soto@tallerdata.cl",
      password: passwordHash,
      nombres: "Lucía",
      apellidos: "Soto",
      cargo: "Recepcionista",
      profileImage: "",
    },
    {
      username: "pcontreras",
      email: "pedro.contreras@tallerdata.cl",
      password: passwordHash,
      nombres: "Pedro",
      apellidos: "Contreras",
      cargo: "Mecánico",
      profileImage: "",
    },
    {
      username: "avaldes",
      email: "andres.valdes@tallerdata.cl",
      password: passwordHash,
      nombres: "Andrés",
      apellidos: "Valdés",
      cargo: "Mecánico",
      profileImage: "",
    },
  ]);

  const [admin, mec1, recep, mec2, mec3] = users;
  console.log(`👤 ${users.length} usuarios creados`);

  // ── Tareas ─────────────────────────────────────────────────────────────────
  const tasksData = [
    // --- COMPLETADAS (mes pasado) ---
    {
      orderNumber: 1001,
      description: "Mantención preventiva 10.000 km",
      date: daysAgo(45),
      clientNombres: "Roberto",
      clientApellidos: "Fuentes Araya",
      clientRUT: "12.345.678-9",
      clientPhone: "+56 9 8123 4567",
      clientEmail: "rfuentes@gmail.com",
      carPlate: "ABCD12",
      carBrand: "Toyota",
      carModel: "Corolla",
      carColor: "Blanco",
      carDetails: "2019, 45.000 km",
      motivoIngreso: "Mantención programada", repairDescription: "Cambio aceite 5W-30, filtro aceite, filtro aire, revisión frenos",
      user: admin._id,
      status: "completada",
      servicePrice: 85000,
      createdBy: recep._id,
      assignedTo: mec1._id,
    },
    {
      orderNumber: 1002,
      description: "Reparación sistema de frenos",
      date: daysAgo(40),
      clientNombres: "Valentina",
      clientApellidos: "Rojas Muñoz",
      clientRUT: "15.678.901-2",
      clientPhone: "+56 9 7654 3210",
      clientEmail: "vrojas@hotmail.com",
      carPlate: "EFGH34",
      carBrand: "Chevrolet",
      carModel: "Spark",
      carColor: "Rojo",
      carDetails: "2018, 68.000 km",
      repairDescription: "Cambio pastillas freno delantero y trasero, rectificado de discos",
      user: admin._id,
      status: "completada",
      servicePrice: 145000,
      createdBy: recep._id,
      assignedTo: mec2._id,
    },
    {
      orderNumber: 1003,
      description: "Cambio correa de distribución",
      date: daysAgo(35),
      clientNombres: "Marcelo",
      clientApellidos: "Espinoza Lagos",
      clientRUT: "8.901.234-5",
      clientPhone: "+56 9 6543 2109",
      clientEmail: "mespinoza@empresa.cl",
      carPlate: "IJKL56",
      carBrand: "Hyundai",
      carModel: "Elantra",
      carColor: "Gris",
      carDetails: "2016, 92.000 km",
      repairDescription: "Cambio correa distribución, tensor y bomba de agua preventivo",
      user: admin._id,
      status: "completada",
      servicePrice: 280000,
      createdBy: admin._id,
      assignedTo: mec1._id,
    },
    {
      orderNumber: 1004,
      description: "Diagnóstico electrónico y reparación",
      date: daysAgo(30),
      clientNombres: "Carmen",
      clientApellidos: "Gloria Vidal",
      clientRUT: "11.222.333-4",
      clientPhone: "+56 9 5432 1098",
      clientEmail: "cgvidal@gmail.com",
      carPlate: "MNOP78",
      carBrand: "Kia",
      carModel: "Rio",
      carColor: "Azul",
      carDetails: "2020, 31.000 km",
      repairDescription: "Luz check engine, diagnóstico OBD2, sensor MAF defectuoso - reemplazo",
      user: admin._id,
      status: "completada",
      servicePrice: 195000,
      createdBy: recep._id,
      assignedTo: mec3._id,
    },
    {
      orderNumber: 1005,
      description: "Mantención 20.000 km + revisión suspensión",
      date: daysAgo(25),
      clientNombres: "Felipe",
      clientApellidos: "Sandoval Reyes",
      clientRUT: "14.555.666-7",
      clientPhone: "+56 9 4321 0987",
      clientEmail: "fsandoval@yahoo.com",
      carPlate: "QRST90",
      carBrand: "Nissan",
      carModel: "Sentra",
      carColor: "Negro",
      carDetails: "2017, 78.000 km",
      repairDescription: "Cambio aceite, filtros, bujías, revisión amortiguadores - ok",
      user: admin._id,
      status: "completada",
      servicePrice: 120000,
      createdBy: recep._id,
      assignedTo: mec2._id,
    },
    {
      orderNumber: 1006,
      description: "Reparación caja de cambios",
      date: daysAgo(20),
      clientNombres: "Isabel",
      clientApellidos: "Torres Pino",
      clientRUT: "9.876.543-2",
      clientPhone: "+56 9 3210 9876",
      clientEmail: "itorres@gmail.com",
      carPlate: "UVWX12",
      carBrand: "Ford",
      carModel: "Focus",
      carColor: "Plateado",
      carDetails: "2015, 115.000 km",
      repairDescription: "Falla en 3ra marcha, reparación sincronizador caja manual",
      user: admin._id,
      status: "completada",
      servicePrice: 420000,
      createdBy: admin._id,
      assignedTo: mec1._id,
    },
    {
      orderNumber: 1007,
      description: "Cambio neumáticos y alineación",
      date: daysAgo(18),
      clientNombres: "Rodrigo",
      clientApellidos: "Alvarado Mora",
      clientRUT: "13.111.222-3",
      clientPhone: "+56 9 2109 8765",
      clientEmail: "ralvarado@outlook.com",
      carPlate: "YZAB34",
      carBrand: "Mazda",
      carModel: "3",
      carColor: "Rojo",
      carDetails: "2021, 22.000 km",
      repairDescription: "Cambio 4 neumáticos 205/55 R16, alineación y balanceo",
      user: admin._id,
      status: "completada",
      servicePrice: 310000,
      createdBy: recep._id,
      assignedTo: mec3._id,
    },
    {
      orderNumber: 1008,
      description: "Revisión técnica y correcciones",
      date: daysAgo(15),
      clientNombres: "Daniela",
      clientApellidos: "Herrera Campos",
      clientRUT: "16.444.555-6",
      clientPhone: "+56 9 1098 7654",
      clientEmail: "dherrera@gmail.com",
      carPlate: "CDEF56",
      carBrand: "Suzuki",
      carModel: "Swift",
      carColor: "Blanco",
      carDetails: "2019, 44.000 km",
      repairDescription: "Preparación revisión técnica: luces, frenos, emisiones - aprobado",
      user: admin._id,
      status: "completada",
      servicePrice: 75000,
      createdBy: recep._id,
      assignedTo: mec2._id,
    },
    // --- EN CURSO (recientes) ---
    {
      orderNumber: 1009,
      description: "Reparación motor overheating",
      date: daysAgo(8),
      clientNombres: "Gonzalo",
      clientApellidos: "Pérez Ibáñez",
      clientRUT: "10.777.888-9",
      clientPhone: "+56 9 9988 7766",
      clientEmail: "gperez@gmail.com",
      carPlate: "GHIJ78",
      carBrand: "Honda",
      carModel: "Civic",
      carColor: "Azul",
      carDetails: "2014, 130.000 km",
      repairDescription: "Motor recalentándose, diagnóstico: junta culata posiblemente quemada",
      user: admin._id,
      status: "en curso",
      servicePrice: 680000,
      createdBy: recep._id,
      assignedTo: mec1._id,
    },
    {
      orderNumber: 1010,
      description: "Cambio embrague completo",
      date: daysAgo(7),
      clientNombres: "Alejandra",
      clientApellidos: "Muñoz Castro",
      clientRUT: "7.654.321-0",
      clientPhone: "+56 9 8877 6655",
      clientEmail: "amunoz@hotmail.com",
      carPlate: "KLMN90",
      carBrand: "Volkswagen",
      carModel: "Gol",
      carColor: "Gris",
      carDetails: "2013, 145.000 km",
      repairDescription: "Embrague patinando, cambio kit embrague completo (disco, prensa, collarín)",
      user: admin._id,
      status: "en curso",
      servicePrice: 380000,
      createdBy: admin._id,
      assignedTo: mec2._id,
    },
    {
      orderNumber: 1011,
      description: "Sistema eléctrico - cortocircuito",
      date: daysAgo(6),
      clientNombres: "Hernán",
      clientApellidos: "Castillo Rojo",
      clientRUT: "18.123.456-7",
      clientPhone: "+56 9 7766 5544",
      clientEmail: "hcastillo@empresa.cl",
      carPlate: "OPQR12",
      carBrand: "Peugeot",
      carModel: "208",
      carColor: "Negro",
      carDetails: "2018, 56.000 km",
      repairDescription: "Cortocircuito en sistema luces, revisión cableado completo",
      user: admin._id,
      status: "en curso",
      servicePrice: 220000,
      createdBy: recep._id,
      assignedTo: mec3._id,
    },
    {
      orderNumber: 1012,
      description: "Mantención 30.000 km SUV",
      date: daysAgo(4),
      clientNombres: "Bárbara",
      clientApellidos: "Figueroa León",
      clientRUT: "12.999.000-1",
      clientPhone: "+56 9 6655 4433",
      clientEmail: "bfigueroa@gmail.com",
      carPlate: "STUV34",
      carBrand: "Jeep",
      carModel: "Compass",
      carColor: "Verde",
      carDetails: "2022, 30.000 km",
      repairDescription: "Mantención preventiva 30k: aceite 0W-20 sintético, filtros, revisión 4x4",
      user: admin._id,
      status: "en curso",
      servicePrice: 165000,
      createdBy: recep._id,
      assignedTo: mec1._id,
    },
    {
      orderNumber: 1013,
      description: "Reparación suspensión delantera",
      date: daysAgo(3),
      clientNombres: "Cristian",
      clientApellidos: "Flores Vega",
      clientRUT: "15.000.111-2",
      clientPhone: "+56 9 5544 3322",
      clientEmail: "cflores@yahoo.com",
      carPlate: "WXYZ56",
      carBrand: "Renault",
      carModel: "Logan",
      carColor: "Blanco",
      carDetails: "2017, 88.000 km",
      repairDescription: "Ruidos suspensión delantera, cambio amortiguadores y muelles",
      user: admin._id,
      status: "en curso",
      servicePrice: 290000,
      createdBy: admin._id,
      assignedTo: mec2._id,
    },
    {
      orderNumber: 1014,
      description: "Diagnóstico falla arranque",
      date: daysAgo(2),
      clientNombres: "Pamela",
      clientApellidos: "Quezada Silva",
      clientRUT: "11.888.999-0",
      clientPhone: "+56 9 4433 2211",
      clientEmail: "pquezada@gmail.com",
      carPlate: "ABCD78",
      carBrand: "Subaru",
      carModel: "Outback",
      carColor: "Plateado",
      carDetails: "2020, 41.000 km",
      repairDescription: "Auto no arranca con frío, diagnóstico sensor temperatura y batería",
      user: admin._id,
      status: "en curso",
      servicePrice: 135000,
      createdBy: recep._id,
      assignedTo: mec3._id,
    },
    {
      orderNumber: 1015,
      description: "Revisión general pre-viaje",
      date: daysAgo(1),
      clientNombres: "Jorge",
      clientApellidos: "Medina Tapia",
      clientRUT: "9.111.222-3",
      clientPhone: "+56 9 3322 1100",
      clientEmail: "jmedina@outlook.com",
      carPlate: "EFGH90",
      carBrand: "Toyota",
      carModel: "Hilux",
      carColor: "Blanco",
      carDetails: "2021, 62.000 km",
      repairDescription: "Revisión completa previa a viaje largo: frenos, neumáticos, niveles",
      user: admin._id,
      status: "en curso",
      servicePrice: 55000,
      createdBy: recep._id,
      assignedTo: mec1._id,
    },
  ];

  const tasks = await Task.insertMany(tasksData);
  console.log(`🔧 ${tasks.length} órdenes de trabajo creadas`);

  // ── Resumen ────────────────────────────────────────────────────────────────
  const completadas = tasks.filter(t => t.status === "completada").length;
  const enCurso     = tasks.filter(t => t.status === "en curso").length;
  const ingresos    = tasks
    .filter(t => t.status === "completada")
    .reduce((s, t) => s + t.servicePrice, 0);

  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║        SEED COMPLETADO ✅              ║");
  console.log("╠═══════════════════════════════════════╣");
  console.log(`║  Usuarios:    ${users.length}                       ║`);
  console.log(`║  Órdenes:     ${tasks.length} (${completadas} completadas, ${enCurso} en curso)║`);
  console.log(`║  Ingresos:    $${new Intl.NumberFormat("es-CL").format(ingresos)} CLP    ║`);
  console.log("╠═══════════════════════════════════════╣");
  console.log("║  CREDENCIALES DE ACCESO               ║");
  console.log("║  Email:    jimmy.duarte@tallerdata.cl ║");
  console.log("║  Password: Admin1234                  ║");
  console.log("╚═══════════════════════════════════════╝\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
