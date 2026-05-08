import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTask } from "../context/TaskContext";
import { useTheme } from "../context/ThemeContext";
import { carBrands } from "../components/carBrands.jsx";
import axios from "../api/axios";

// ── Validador RUT chileno ─────────────────────────────────────────────────────
function validarRUT(rut) {
  if (!rut || typeof rut !== "string") return false;
  const clean = rut.replace(/[\.\-\s]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let suma = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalc =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);
  return dv === dvCalc;
}

// Auto-formatea mientras escribe: 12345678 → 12.345.678-9
function formatRUT(value) {
  const clean = value.replace(/[\.\-\s]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

// ── Componentes de UI ─────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  const { theme: t } = useTheme();
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: t.textMuted }}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
        <span className="material-icons text-sm">error_outline</span>{error}
      </p>}
    </div>
  );
}

function Section({ icon, title, children }) {
  const { theme: t } = useTheme();
  return (
    <div className="rounded-2xl p-6" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
        style={{ color: t.accent }}>
        <span className="material-icons text-base">{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TaskFormPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError, clearErrors } = useForm();
  const { getTasks, updateTask, tasks, createTask } = useTask();
  const { theme: t } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [customBrand, setCustomBrand] = useState("");
  const [rutValue, setRutValue] = useState("");
  const [rutValid, setRutValid] = useState(null); // null | true | false
  const selectedBrand = watch("carBrand");
  const [users, setUsers] = useState([]);

  const inp = `w-full p-3 rounded-xl text-sm outline-none transition-all`;
  const is = { background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text };

  useEffect(() => {
    axios.get("/api/users", { withCredentials: true }).then(r => setUsers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      if (tasks.length === 0) getTasks();
      else {
        const task = tasks.find(tk => tk._id === id);
        if (task) {
          setValue("clientNombres", task.clientNombres || "");
          setValue("clientApellidos", task.clientApellidos || "");

          ["clientRUT","clientPhone","clientEmail","carPlate","carBrand","carModel",
           "carColor","carYear","carKm","carDamages","carDetails","motivoIngreso",
           "diagnosticoTaller","repairDescription","description","servicePrice","orderNumber"
          ].forEach(f => setValue(f, task[f] || ""));

          if (task.clientRUT) {
            setRutValue(task.clientRUT);
            setRutValid(validarRUT(task.clientRUT));
          }
          if (task.assignedTo) setValue("assignedTo", task.assignedTo._id || task.assignedTo);
        }
        setLoading(false);
      }
    } else setLoading(false);
  }, [id, tasks]);

  // Manejo del RUT con formato y validación en tiempo real
  const handleRutChange = (e) => {
    const raw = e.target.value;
    // Permitir borrar libremente
    if (raw.length < rutValue.length && !raw.includes("-")) {
      setRutValue(raw);
      setRutValid(null);
      setValue("clientRUT", raw);
      clearErrors("clientRUT");
      return;
    }
    const formatted = formatRUT(raw.replace(/[\.\-]/g, ""));
    setRutValue(formatted);
    setValue("clientRUT", formatted);
    const valid = validarRUT(formatted);
    setRutValid(valid);
    if (!valid && formatted.length > 3) {
      setError("clientRUT", { type: "manual", message: "RUT inválido" });
    } else {
      clearErrors("clientRUT");
    }
  };

  const onSubmit = async (data) => {
    // Validar RUT antes de enviar
    if (!validarRUT(data.clientRUT)) {
      setError("clientRUT", { type: "manual", message: "RUT inválido — verifica el número" });
      return;
    }
    // Unir nombres y apellidos en clientName
    const finalData = {
      ...data,
      carBrand: selectedBrand === "Otro" ? customBrand : data.carBrand,
    };
    if (id) await updateTask(id, finalData);
    else await createTask(finalData);
    navigate(location.state?.returnTo || "/tasks");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: t.bg, color: t.text }}>
      Cargando...
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: t.bg, color: t.text }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: t.text }}>
            {id ? "✏️ Editar Orden" : "➕ Nueva Orden"}
          </h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>Complete todos los campos requeridos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Datos del cliente ── */}
          <Section icon="person" title="Datos del Cliente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Nombres */}
              <Field label="Nombres" error={errors.clientNombres && "Requerido"}>
                <input
                  {...register("clientNombres", { required: true })}
                  placeholder="Nombres del cliente"
                  className={inp} style={is}
                />
              </Field>

              {/* Apellidos */}
              <Field label="Apellidos" error={errors.clientApellidos && "Requerido"}>
                <input
                  {...register("clientApellidos", { required: true })}
                  placeholder="Apellidos del cliente"
                  className={inp} style={is}
                />
              </Field>

              {/* RUT con validación */}
              <Field label="RUT" error={errors.clientRUT?.message}>
                <div className="relative">
                  <input
                    {...register("clientRUT", { required: "Requerido" })}
                    value={rutValue}
                    onChange={handleRutChange}
                    placeholder="12.345.678-9"
                    maxLength={12}
                    className={inp}
                    style={{
                      ...is,
                      border: `1px solid ${
                        rutValid === true ? "#4ade80" :
                        rutValid === false ? "#f87171" :
                        t.inputBorder
                      }`,
                      paddingRight: "40px",
                    }}
                  />
                  {/* Ícono de estado */}
                  {rutValid !== null && (
                    <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                      style={{ color: rutValid ? "#4ade80" : "#f87171" }}>
                      {rutValid ? "check_circle" : "cancel"}
                    </span>
                  )}
                </div>
                {rutValid === true && (
                  <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <span className="material-icons text-sm">check_circle</span> RUT válido
                  </p>
                )}
              </Field>

              {/* Teléfono */}
              <Field label="Teléfono" error={errors.clientPhone && "Requerido"}>
                <input
                  {...register("clientPhone", { required: true })}
                  placeholder="+56 9 1234 5678"
                  className={inp} style={is}
                />
              </Field>

              {/* Email */}
              <Field label="Email" error={errors.clientEmail && "Requerido"}>
                <input
                  type="email"
                  {...register("clientEmail", { required: true })}
                  placeholder="correo@ejemplo.com"
                  className={inp} style={is}
                />
              </Field>
            </div>
          </Section>

          {/* ── Datos del vehículo ── */}
          <Section icon="directions_car" title="Datos del Vehículo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Patente" error={errors.carPlate && "Requerido"}>
                <input {...register("carPlate", { required: true })} placeholder="ABCD12"
                  className={inp} style={{ ...is, textTransform: "uppercase" }} />
              </Field>
              <Field label="Marca" error={errors.carBrand && "Requerido"}>
                <select {...register("carBrand", { required: true })} className={inp} style={is}>
                  <option value="">Selecciona una marca</option>
                  {carBrands.map((b, i) => <option key={i} value={b}>{b}</option>)}
                </select>
              </Field>
              {selectedBrand === "Otro" && (
                <Field label="Otra marca">
                  <input type="text" placeholder="Escribe la marca" value={customBrand}
                    onChange={e => setCustomBrand(e.target.value)} className={inp} style={is} />
                </Field>
              )}
              <Field label="Modelo" error={errors.carModel && "Requerido"}>
                <input {...register("carModel", { required: true })} placeholder="Corolla, Civic, etc."
                  className={inp} style={is} />
              </Field>
              <Field label="Color" error={errors.carColor && "Requerido"}>
                <input {...register("carColor", { required: true })} placeholder="Color del vehículo"
                  className={inp} style={is} />
              </Field>
              <Field label="Año">
                <input {...register("carYear")} placeholder="Ej: 2020" className={inp} style={is} />
              </Field>
              <Field label="Kilometraje">
                <input {...register("carKm")} placeholder="Ej: 45.000 km" className={inp} style={is} />
              </Field>
              <Field label="Daños Visibles">
                <input {...register("carDamages")} placeholder="Descripción de daños visibles"
                  className={inp} style={is} />
              </Field>
              <Field label="Detalles Extraordinarios">
                <input {...register("carDetails")} placeholder="Cualquier detalle importante"
                  className={inp} style={is} />
              </Field>
            </div>
          </Section>

          {/* ── Datos de la orden ── */}
          <Section icon="build" title="Datos de la Orden">
            <div className="space-y-4">
              <Field label="Motivo de Ingreso" error={errors.motivoIngreso && "Requerido"}>
                <textarea {...register("motivoIngreso", { required: true })} rows={3}
                  placeholder="¿Por qué ingresa el vehículo al taller?" className={inp} style={is} />
              </Field>
              <Field label="Diagnóstico Taller">
                <textarea {...register("diagnosticoTaller")} rows={3}
                  placeholder="Diagnóstico técnico del taller..." className={inp} style={is} />
              </Field>
              <Field label="Descripción de la Reparación / Cambio de Piezas" error={errors.repairDescription && "Requerido"}>
                <textarea {...register("repairDescription", { required: true })} rows={3}
                  placeholder="Detalle de trabajos, repuestos y piezas utilizadas..." className={inp} style={is} />
              </Field>
              <Field label="Observaciones Generales">
                <textarea {...register("description")} rows={2}
                  placeholder="Observaciones adicionales..." className={inp} style={is} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Precio del Servicio (CLP)" error={errors.servicePrice?.message}>
                  <input type="number" step="1" placeholder="85000"
                    {...register("servicePrice", { required: "Requerido", min: { value: 0, message: "No puede ser negativo" } })}
                    className={inp} style={is} />
                  {watch("servicePrice") > 0 && (
                    <div className="mt-2 p-2.5 rounded-lg text-xs space-y-1" style={{ background: t.bgSecondary }}>
                      <div className="flex justify-between" style={{ color: t.textMuted }}>
                        <span>Neto</span>
                        <span>${new Intl.NumberFormat("es-CL").format(Number(watch("servicePrice")))} CLP</span>
                      </div>
                      <div className="flex justify-between" style={{ color: t.textMuted }}>
                        <span>IVA (19%)</span>
                        <span>${new Intl.NumberFormat("es-CL").format(Math.round(Number(watch("servicePrice")) * 0.19))} CLP</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1" style={{ borderTop: `1px solid ${t.border}`, color: "#4ade80" }}>
                        <span>Total c/IVA</span>
                        <span>${new Intl.NumberFormat("es-CL").format(Math.round(Number(watch("servicePrice")) * 1.19))} CLP</span>
                      </div>
                    </div>
                  )}
                </Field>
                <Field label="Mecánico / Personal Asignado" error={errors.assignedTo && "Requerido"}>
                  <select {...register("assignedTo", { required: true })} className={inp} style={is}>
                    <option value="">Selecciona un usuario</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.username || u.email}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate("/tasks")}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: t.bgSecondary, color: t.textMuted }}>
              Cancelar
            </button>
            <button type="submit"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${t.accent},${t.accentSecondary})` }}>
              {id ? "Actualizar Orden" : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
