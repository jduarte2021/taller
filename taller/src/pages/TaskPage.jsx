import { useTask } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { generateOrderPDF } from "../utils/pdfGenerator.js";

function StatusBadge({ status }) {
  const cfg =
    status === "completada"
      ? {
          bg: "#052e16",
          text: "#4ade80",
          label: "✔ Completada",
        }
      : {
          bg: "#451a03",
          text: "#fb923c",
          label: "⏳ En curso",
        };

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
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

  const isAdmin =
    user?.cargo === "Administrador" ||
    user?.email?.includes("jimmy.duarte");

  useEffect(() => {
    getTasks();
  }, []);

  const filtered = useMemo(() => {
    let list = Array.isArray(tasks) ? [...tasks] : [];

    if (filter !== "all") {
      list = list.filter((tk) => tk.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (tk) =>
          `${tk.clientNombres} ${tk.clientApellidos}`
            .toLowerCase()
            .includes(q) ||
          tk.orderNumber?.toString().includes(q) ||
          tk.carPlate?.toLowerCase().includes(q) ||
          tk.carBrand?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sortBy === "date_desc"
        ? new Date(b.date) - new Date(a.date)
        : sortBy === "date_asc"
        ? new Date(a.date) - new Date(b.date)
        : sortBy === "price_desc"
        ? (b.servicePrice || 0) - (a.servicePrice || 0)
        : (a.servicePrice || 0) - (b.servicePrice || 0)
    );

    return list;
  }, [tasks, filter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = Array.isArray(filtered)
    ? filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      )
    : [];

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar orden?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      background: t.bgCard,
      color: t.text,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: t.bgSecondary,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) {
        deleteTask(id);

        if (expandedId === id) {
          setExpandedId(null);
        }
      }
    });
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/tasks/${id}/complete`);

      Swal.fire({
        title: "¡Completada!",
        icon: "success",
        background: t.bgCard,
        color: t.text,
        timer: 1500,
        showConfirmButton: false,
      });

      getTasks();
    } catch {
      Swal.fire({
        title: "Error",
        icon: "error",
        background: t.bgCard,
        color: t.text,
      });
    }
  };

  const handlePDF = async (task) => {
    await generateOrderPDF(task);
  };

  const handleSendBudget = async (task) => {
    const neto = task.servicePrice || 0;
    const iva = Math.round(neto * 0.19);
    const total = neto + iva;

    const fmt = (n) =>
      `$${new Intl.NumberFormat("es-CL").format(n)}`;

    const { value: mensaje } = await Swal.fire({
      title: "Enviar presupuesto al cliente",
      html: `
        <p style="margin-bottom:8px;font-size:13px;">
          Se enviará a <strong>${task.clientEmail}</strong>
        </p>

        <textarea
          id="budget-msg"
          style="
            width:100%;
            height:80px;
            padding:8px;
            border-radius:8px;
            border:1px solid #334155;
            background:#1e293b;
            color:#f1f5f9;
            font-size:13px;
            resize:none;
          "
          placeholder="Mensaje adicional (opcional)"
        ></textarea>

        <div
          style="
            margin-top:12px;
            padding:10px;
            background:#0f172a;
            border-radius:8px;
            text-align:left;
            font-size:12px;
          "
        >
          <div style="color:#94a3b8;">
            Neto:
            <strong style="color:#f1f5f9;">
              ${fmt(neto)}
            </strong>
          </div>

          <div style="color:#94a3b8;">
            IVA (19%):
            <strong style="color:#f1f5f9;">
              ${fmt(iva)}
            </strong>
          </div>

          <div
            style="
              color:#94a3b8;
              font-size:14px;
              margin-top:4px;
            "
          >
            Total:
            <strong style="color:#4ade80;">
              ${fmt(total)}
            </strong>
          </div>
        </div>
      `,
      background: t.bgCard,
      color: t.text,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      preConfirm: () =>
        document.getElementById("budget-msg").value,
    });

    if (mensaje === undefined) return;

    const msg = `
Estimado/a ${task.clientNombres} ${task.clientApellidos},

Le enviamos el presupuesto para su vehículo:

${task.carBrand} ${task.carModel}
(${task.carPlate})

Motivo:
${task.motivoIngreso || task.repairDescription || "Servicio de taller"}

— Precio neto: ${fmt(neto)}
— IVA (19%): ${fmt(iva)}
— TOTAL: ${fmt(total)}

${mensaje ? `Observaciones: ${mensaje}` : ""}

Quedamos a su disposición.

TallerData — Software para Taller Mecánico
`;

    try {
      await api.post("/email/send", {
        to: task.clientEmail,
        subject: `Presupuesto TallerData — Orden #${task.orderNumber}`,
        message: msg,
      });

      Swal.fire({
        title: "¡Presupuesto enviado!",
        icon: "success",
        background: t.bgCard,
        color: t.text,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Error al enviar",
        text:
          err.response?.data?.message ||
          "Verifica configuración SMTP",
        icon: "error",
        background: t.bgCard,
        color: t.text,
      });
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: t.bg,
        color: t.text,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* resto del JSX intacto */}

        {Array.isArray(paginated) &&
          paginated.map((task) => {
            return (
              <div key={task._id}>
                {/* contenido task */}
              </div>
            );
          })}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
            >
              ← Anterior
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}