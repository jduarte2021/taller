import { useTask } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../api/axios";
import { generateOrderPDF } from "../utils/pdfGenerator.js";

function StatusBadge({ status }) {
  const cfg = status === "completada" ? { bg: "#052e16", text: "#4ade80", label: "✔ Completada" } : { bg: "#451a03", text: "#fb923c", label: "⏳ En curso" };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>;
}

const ITEMS_PER_PAGE = 10;

export default function TaskPage() {
  const { getTasks, tasks, deleteTask } = useTask();
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const isAdmin = user?.cargo === "Administrador" || user?.email?.includes("jimmy.duarte");

  useEffect(() => { getTasks(); }, []);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter !== "all") list = list.filter(tk => tk.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tk => (`${tk.clientNombres} ${tk.clientApellidos}`).toLowerCase().includes(q) || tk.orderNumber?.toString().includes(q) || tk.carPlate?.toLowerCase().includes(q) || tk.carBrand?.toLowerCase().includes(q));
    }
    list.sort((a, b) => sortBy === "date_desc" ? new Date(b.date)-new Date(a.date) : sortBy === "date_asc" ? new Date(a.date)-new Date(b.date) : sortBy === "price_desc" ? (b.servicePrice||0)-(a.servicePrice||0) : (a.servicePrice||0)-(b.servicePrice||0));
    return list;
  }, [tasks, filter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const handleDelete = (id) => {
    Swal.fire({ title:"¿Eliminar orden?", text:"Esta acción no se puede deshacer", icon:"warning", background:t.bgCard, color:t.text, showCancelButton:true, confirmButtonColor:"#ef4444", cancelButtonColor:t.bgSecondary, confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar" })
      .then(r => { if (r.isConfirmed) { deleteTask(id); if (expandedId===id) setExpandedId(null); } });
  };

  const handleComplete = async (id) => {
    try { await axios.put(`/api/tasks/${id}/complete`); Swal.fire({title:"¡Completada!",icon:"success",background:t.bgCard,color:t.text,timer:1500,showConfirmButton:false}); getTasks(); }
    catch { Swal.fire({title:"Error",icon:"error",background:t.bgCard,color:t.text}); }
  };

  const handlePDF = async (task) => {
    await generateOrderPDF(task);
  };

  const handleSendBudget = async (task) => {
    const neto = task.servicePrice || 0;
    const iva = Math.round(neto * 0.19);
    const total = neto + iva;
    const fmt = n => `$${new Intl.NumberFormat("es-CL").format(n)}`;
    const { value: mensaje } = await Swal.fire({
      title: "Enviar presupuesto al cliente",
      html: `<p style="margin-bottom:8px;font-size:13px;">Se enviará a <strong>${task.clientEmail}</strong></p>
        <textarea id="budget-msg" style="width:100%;height:80px;padding:8px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9;font-size:13px;resize:none;" placeholder="Mensaje adicional (opcional)"></textarea>
        <div style="margin-top:12px;padding:10px;background:#0f172a;border-radius:8px;text-align:left;font-size:12px;">
          <div style="color:#94a3b8;">Neto: <strong style="color:#f1f5f9;">${fmt(neto)}</strong></div>
          <div style="color:#94a3b8;">IVA (19%): <strong style="color:#f1f5f9;">${fmt(iva)}</strong></div>
          <div style="color:#94a3b8;font-size:14px;margin-top:4px;">Total: <strong style="color:#4ade80;">${fmt(total)}</strong></div>
        </div>`,
      background: t.bgCard, color: t.text,
      showCancelButton: true, confirmButtonText: "Enviar", cancelButtonText: "Cancelar",
      preConfirm: () => document.getElementById("budget-msg").value,
    });
    if (mensaje === undefined) return;
    const msg = `Estimado/a ${task.clientNombres} ${task.clientApellidos},\n\nLe enviamos el presupuesto para su vehículo ${task.carBrand} ${task.carModel} (${task.carPlate}):\n\nMotivo: ${task.motivoIngreso || task.repairDescription || "Servicio de taller"}\n\n— Precio neto:  ${fmt(neto)}\n— IVA (19%):    ${fmt(iva)}\n— TOTAL:        ${fmt(total)}\n${mensaje ? `\nObservaciones: ${mensaje}` : ""}\n\nQuedamos a su disposición.\nTallerData — Software para Taller Mecánico`;
    try {
      await axios.post("/api/email/send", { to: task.clientEmail, subject: `Presupuesto TallerData — Orden #${task.orderNumber}`, message: msg }, { withCredentials: true });
      Swal.fire({ title:"¡Presupuesto enviado!", icon:"success", background:t.bgCard, color:t.text, timer:2000, showConfirmButton:false });
    } catch (err) {
      Swal.fire({ title:"Error al enviar", text: err.response?.data?.message || "Verifica configuración SMTP", icon:"error", background:t.bgCard, color:t.text });
    }
  };

  return (
    <div className="min-h-screen p-6" style={{background:t.bg,color:t.text}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{color:t.text}}>📋 Órdenes</h1>
            <p className="text-sm mt-1" style={{color:t.textMuted}}>{filtered.length} órdenes encontradas</p>
          </div>
          <button onClick={() => navigate("/add-task")} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white" style={{background:`linear-gradient(135deg,${t.accent},${t.accentSecondary})`}}>
            <span className="material-icons text-base">add_task</span> Nueva
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="flex-1 min-w-48 relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{color:t.textMuted}}>search</span>
            <input type="text" placeholder="Buscar cliente, patente, marca..." value={search}
              onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{background:t.input,border:`1px solid ${t.inputBorder}`,color:t.text}} />
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{border:`1px solid ${t.border}`}}>
            {[["all","Todas"],["en curso","En curso"],["completada","Completadas"]].map(([val,label]) => (
              <button key={val} onClick={() => {setFilter(val); setPage(1);}}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{background:filter===val?(val==="completada"?"#052e16":val==="en curso"?"#451a03":`${t.accent}20`):t.bgSecondary, color:filter===val?(val==="completada"?"#4ade80":val==="en curso"?"#fb923c":t.accent):t.textMuted}}>
                {label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl text-xs outline-none" style={{background:t.input,border:`1px solid ${t.inputBorder}`,color:t.text}}>
            <option value="date_desc">📅 Más recientes</option>
            <option value="date_asc">📅 Más antiguas</option>
            <option value="price_desc">💰 Mayor precio</option>
            <option value="price_asc">💰 Menor precio</option>
          </select>
        </div>

        {/* Lista */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{color:t.textMuted}}>
            <span className="material-icons text-5xl mb-3">inbox</span><p className="text-lg font-semibold">No hay órdenes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map(task => {
              const isExpanded = expandedId === task._id;
              const neto = task.servicePrice || 0;
              const iva = Math.round(neto * 0.19);
              const total = neto + iva;
              const fmt = n => `$${new Intl.NumberFormat("es-CL").format(n)}`;

              return (
                <div key={task._id} className="rounded-2xl border transition-all" style={{background:task.status==="completada"?`linear-gradient(135deg,#052e1680,${t.bgCard})`:t.bgCard, border:`1px solid ${task.status==="completada"?"#166534":t.border}`}}>
                  {/* Header siempre visible */}
                  <div className="p-4 flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded?null:task._id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono" style={{color:t.textMuted}}>#{task.orderNumber}</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <h3 className="font-bold truncate" style={{color:t.text}}>{task.clientNombres} {task.clientApellidos}</h3>
                      <p className="text-sm mt-0.5" style={{color:t.textMuted}}>{task.carBrand} {task.carModel} — <span className="font-mono">{task.carPlate}</span></p>
                      <p className="text-xs mt-1" style={{color:t.textMuted}}>{new Date(task.date).toLocaleDateString("es-CL")} · {task.assignedTo?`${task.assignedTo.nombres} ${task.assignedTo.apellidos}`:"Sin asignar"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{color:"#4ade80"}}>{fmt(total)}</div>
                        <div className="text-xs" style={{color:t.textMuted}}>c/IVA</div>
                      </div>
                      <span className="material-icons text-lg transition-transform duration-200" style={{color:t.textMuted, transform:isExpanded?"rotate(180deg)":"rotate(0deg)"}}>expand_more</span>
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t" style={{borderColor:t.border}}>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-4">
                        {[["RUT",task.clientRUT],["Teléfono",task.clientPhone],["Email",task.clientEmail],["Color",task.carColor],["Año",task.carYear||"—"],["KM",task.carKm||"—"],["Daños",task.carDamages||"—"],["Neto",fmt(neto)],["IVA (19%)",fmt(iva)],["Total c/IVA",fmt(total)],["Creado por",task.createdBy?.username||"—"],...(task.editedBy?[["Editado por",task.editedBy?.username||"—"]]:[])].map(([k,v]) => (
                          <div key={k} className="py-1.5 border-b" style={{borderColor:t.border}}>
                            <div className="text-xs" style={{color:t.textMuted}}>{k}</div>
                            <div className="font-medium" style={{color:t.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {[["Motivo de Ingreso",task.motivoIngreso],["Diagnóstico Taller",task.diagnosticoTaller],["Descripción Reparación / Cambio de Piezas",task.repairDescription],["Observaciones",task.description]].filter(([,v])=>v).map(([k,v])=>(
                        <div key={k} className="mt-3 p-3 rounded-xl" style={{background:t.bgSecondary}}>
                          <div className="text-xs font-semibold mb-1" style={{color:t.textMuted}}>{k}</div>
                          <p className="text-sm" style={{color:t.text}}>{v}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 flex-wrap mt-4 no-print">
                        {isAdmin && (
                          <>
                            <button onClick={() => navigate(`/task/${task._id}`)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:`${t.accent}20`,color:t.accent}}>
                              <span className="material-icons text-sm">edit</span> Editar
                            </button>
                            <button onClick={() => handleDelete(task._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#450a0a",color:"#f87171"}}>
                              <span className="material-icons text-sm">delete</span> Borrar
                            </button>
                          </>
                        )}
                        <button onClick={() => handlePDF(task)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#1a2e1a",color:"#4ade80"}}>
                          <span className="material-icons text-sm">picture_as_pdf</span> PDF
                        </button>
                        <button onClick={() => handleSendBudget(task)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:`${t.accent}15`,color:t.accent,border:`1px solid ${t.accent}30`}}>
                          <span className="material-icons text-sm">send</span> Presupuesto
                        </button>
                        {task.status!=="completada" && (
                          <button onClick={() => handleComplete(task._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ml-auto" style={{background:"linear-gradient(135deg,#052e16,#166534)",color:"#4ade80",border:"1px solid #166534"}}>
                            <span className="material-icons text-sm">check_circle</span> Completar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-30" style={{background:t.bgSecondary,color:t.textMuted}}>← Anterior</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} className="w-9 h-9 rounded-lg text-sm font-bold" style={{background:p===page?`linear-gradient(135deg,${t.accent},${t.accentSecondary})`:t.bgSecondary,color:p===page?"#fff":t.textMuted}}>{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-30" style={{background:t.bgSecondary,color:t.textMuted}}>Siguiente →</button>
          </div>
        )}
      </div>
    </div>
  );
}
