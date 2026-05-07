import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from '../components/logo.jsx';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, errors: signinErrors } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async data => {
    try { await signin(data); navigate("/dashboard"); }
    catch (error) { console.error("Error al iniciar sesión:", error.message); }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg,#060f1e 0%,#0f1a2e 100%)" }}>
      <div className="mb-6"><Logo /></div>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        {Array.isArray(signinErrors) ? signinErrors.map((error, i) => (
          <div key={i} className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl mb-4 text-sm">{error}</div>
        )) : null}
        <h1 className="text-2xl font-black text-white mb-2">Inicio de Sesión</h1>
        <p className="text-slate-400 text-sm mb-6">TallerData — Software para Taller Mecánico</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
            <input type="email" {...register("email", { required: true })}
              className="w-full p-3 rounded-xl text-sm outline-none text-white"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
              placeholder="tu@correo.cl" />
            {errors.email && <p className="text-red-400 text-xs mt-1">Email es requerido</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contraseña</label>
            <input type="password" {...register("password", { required: true })}
              className="w-full p-3 rounded-xl text-sm outline-none text-white"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
              placeholder="••••••••" />
            {errors.password && <p className="text-red-400 text-xs mt-1">Contraseña es requerida</p>}
          </div>
          <button type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 mt-2"
            style={{ background: "linear-gradient(135deg,#38bdf8,#6366f1)" }}>
            Iniciar Sesión
          </button>
        </form>
        <p className="text-slate-500 text-xs mt-6 text-center">Para registrarte contacta al administrador del sistema</p>
      </div>
    </div>
  );
}
