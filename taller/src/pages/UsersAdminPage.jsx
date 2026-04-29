import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ROLES = ["superadmin", "Administrador", "Jefe de Taller", "Mecánico", "Recepcionista"];

export default function UsersAdminPage() {
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ username: "", email: "", password: "", nombres: "", apellidos: "", cargo: "Mecánico" });
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.cargo === "Administrador" || user?.email?.includes("jimmy.duarte");
  const isSuperAdmin = user?.username === "jduarte" || user?.email?.includes("jimmy.duarte");

  useEffect(() => { if (!isAdmin) navigate("/dashboard"); }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users/all", { withCredentials: true });
      setUsers(res.data);
    } catch {
      const res = await axios.get("/api/users", { withCredentials: true });
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newCargo) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { cargo: newCargo }, { withCredentials: true });
      Swal.fire({ title: "Rol actualizado", icon: "success", background: t.bgCard, color: t.text, timer: 1500, showConfirmButton: false });
      fetchUsers();
    } catch {
      Swal.fire({ title: "Error al actualizar rol", icon: "error", background: t.bgCard, color: t.text });
    }
  };

  const handleDelete = async (u) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${u.nombres} ${u.apellidos}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      background: t.bgCard,
      color: t.text,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: t.bgSecondary,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/users/${u._id}`, { withCredentials: true });
      Swal.fire({ title: "Usuario eliminado", icon: "success", background: t.bgCard, color: t.text, timer: 1500, showConfirmButton: false });
      fetchUsers();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "No se pudo eliminar", icon: "error", background: t.bgCard, color: t.text });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.nombres || !form.apellidos) {
      Swal.fire({ title: "Completa todos los campos", icon: "warning", background: t.bgCard, color: t.text });
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/register-admin", form, { withCredentials: true });
      Swal.fire({ title: "¡Usuario creado!", text: `${form.nombres} ${form.apellidos} registrado como ${form.cargo}`, icon: "success", background: t.bgCard, color: t.text });
      setForm({ username: "", email: "", password: "", nombres: "", apellidos: "", cargo: "Mecánico" });
      fetchUsers();
      setTab("list");
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "No se pudo registrar", icon: "error", background: t.bgCard, color: t.text });
    }
    setSaving(false);
  };

  const inp = "w-full p-3 rounded-xl text-sm outline-none transition-all";
  const is = { background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text };

  if (loading) return <div className="flex items-center justify-center min-h-screen" style={{ background: t.bg, color: t.text }}>Cargando...</div>;

  return (
    <div className="min-h-screen p-6" style={{ background: t.bg, color: t.text }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: t.text }}>⚙️ Gestión de Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>{users.length} usuarios registrados</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[["list","list_alt","Lista de usuarios"],["register","person_add","Registrar usuario"]].map(([key,icon,label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: tab===key?`linear-gradient(135deg,${t.accent},${t.accentSecondary})`:t.bgSecondary, color: tab===key?"#fff":t.textMuted }}>
              <span className="material-icons text-sm">{icon}</span>{label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {tab === "list" && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: t.bgSecondary }}>
                  {["Usuario","Nombre","Email","Cargo actual",
                    ...(isSuperAdmin ? ["Cambiar rol",""] : [])
                  ].map((h,i) => (
                    <th key={i} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: t.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isMe = u.email === user?.email;
                  const isSA = u.email?.includes("jimmy.duarte");
                  return (
                    <tr key={u._id} style={{ background: i%2===0?t.bgCard:t.bg, borderBottom:`1px solid ${t.border}` }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: t.accent }}>{u.username}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: t.text }}>{u.nombres} {u.apellidos}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: t.textMuted }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background:`${t.accent}20`, color:t.accent }}>{u.cargo}</span>
                      </td>
                      {isSuperAdmin && (
                        <>
                          <td className="px-4 py-3">
                            {isMe ? (
                              <span className="text-xs" style={{ color: t.textMuted }}>Tú (fijo)</span>
                            ) : (
                              <select defaultValue={u.cargo}
                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                className="text-xs px-2 py-1.5 rounded-lg outline-none"
                                style={{ background:t.input, border:`1px solid ${t.inputBorder}`, color:t.text }}>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {!isMe && !isSA && (
                              <button onClick={() => handleDelete(u)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                                style={{ background:"#450a0a", color:"#f87171" }}>
                                <span className="material-icons text-sm">delete</span> Eliminar
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Registro */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="rounded-2xl p-6 space-y-5" style={{ background: t.bgCard, border:`1px solid ${t.border}` }}>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: t.accent }}>Datos del nuevo usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[["Nombres *","nombres","text","Nombres"],["Apellidos *","apellidos","text","Apellidos"],["Username *","username","text","Nombre de usuario"],["Email *","email","email","correo@ejemplo.com"],["Contraseña *","password","password","Mínimo 8 caracteres"]].map(([label,field,type,placeholder]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:t.textMuted }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[field]}
                    onChange={e => setForm({...form,[field]:e.target.value})}
                    className={inp} style={is} required />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color:t.textMuted }}>Cargo *</label>
                <select value={form.cargo} onChange={e => setForm({...form,cargo:e.target.value})} className={inp} style={is}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ background:`linear-gradient(135deg,${t.accent},${t.accentSecondary})` }}>
                <span className="material-icons text-sm">{saving?"hourglass_empty":"person_add"}</span>
                {saving?"Registrando...":"Crear usuario"}
              </button>
              <button type="button" onClick={() => setForm({username:"",email:"",password:"",nombres:"",apellidos:"",cargo:"Mecánico"})}
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ background:t.bgSecondary, color:t.textMuted }}>
                Limpiar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
