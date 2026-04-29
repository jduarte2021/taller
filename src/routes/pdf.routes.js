import { Router } from "express";
import { authRequired } from "../middlewares/validateTokens.js";
import puppeteer from "puppeteer";

const router = Router();

function buildHTML(task) {
  const fmt = (n) =>
    n !== undefined && n !== null && n !== ""
      ? `$${new Intl.NumberFormat("es-CL").format(n)} CLP`
      : "—";

  const row = (label, value) => `
    <tr>
      <td class="label">${label}</td>
      <td class="value">${value || "—"}</td>
    </tr>`;

  const note = (title, text, color) =>
    text ? `
      <div class="note">
        <div class="note-title" style="border-left-color:${color}">${title}</div>
        <div class="note-body">${text}</div>
      </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 28px 32px;
    }
    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 2.5px solid #38bdf8;
    }
    .brand { display:flex; align-items:center; gap:14px; }
    .brand-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg,#0f172a,#1e3a5f);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 900; color: #38bdf8;
    }
    .brand-name { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .print-date { text-align: right; font-size: 11px; color: #64748b; }
    .print-date strong { color: #0f172a; display: block; font-size: 12px; }

    /* Order title */
    .order-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 22px;
    }
    .order-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; }
    .order-number { font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1; }
    .status-badge {
      padding: 6px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .status-completada { background: #052e16; color: #4ade80; }
    .status-en-curso   { background: #451a03; color: #fb923c; }

    /* Sections */
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.5px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px; margin-bottom: 8px;
    }
    table { width: 100%; border-collapse: collapse; }
    .label {
      width: 36%; padding: 4px 16px 4px 0;
      font-weight: 600; color: #475569; font-size: 12px;
      vertical-align: top;
    }
    .value { padding: 4px 0; color: #111; font-size: 12px; vertical-align: top; }

    /* Notes */
    .note { margin-bottom: 12px; }
    .note-title {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: #475569; margin-bottom: 5px;
      padding-left: 8px;
      border-left: 3px solid #38bdf8;
    }
    .note-body {
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.7;
      color: #1e293b;
    }

    /* Footer */
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand">
      <div class="brand-icon">T</div>
      <div>
        <div class="brand-name">TallerData</div>
        <div class="brand-sub">Software para Taller Mecánico</div>
      </div>
    </div>
    <div class="print-date">
      Fecha de impresión
      <strong>${new Date().toLocaleDateString("es-CL")}</strong>
    </div>
  </div>

  <div class="order-header">
    <div>
      <div class="order-label">Orden de Trabajo</div>
      <div class="order-number">#${task.orderNumber}</div>
    </div>
    <div class="status-badge ${task.status === "completada" ? "status-completada" : "status-en-curso"}">
      ${task.status === "completada" ? "✔ Completada" : "⏳ En curso"}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Datos del Cliente</div>
    <table>
      ${row("Nombres", task.clientNombres)}
      ${row("Apellidos", task.clientApellidos)}
      ${row("RUT", task.clientRUT)}
      ${row("Teléfono", task.clientPhone)}
      ${row("Email", task.clientEmail)}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Datos del Vehículo</div>
    <table>
      ${row("Patente", task.carPlate)}
      ${row("Marca / Modelo", `${task.carBrand || ""} ${task.carModel || ""}`.trim())}
      ${row("Color", task.carColor)}
      ${row("Año", task.carYear)}
      ${row("Kilometraje", task.carKm)}
      ${row("Daños visibles", task.carDamages)}
      ${row("Detalles extraordinarios", task.carDetails)}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Datos de la Orden</div>
    <table>
      ${row("Precio neto", fmt(task.servicePrice))}
        ${row("IVA (19%)", fmt(Math.round((task.servicePrice||0) * 0.19)))}
        ${row("Total con IVA", `<strong>$${new Intl.NumberFormat("es-CL").format(Math.round((task.servicePrice||0) * 1.19))} CLP</strong>`)}
      ${row("Mecánico asignado", task.assignedTo
        ? `${task.assignedTo.nombres} ${task.assignedTo.apellidos}`
        : "No asignado")}
      ${row("Fecha de ingreso", new Date(task.date).toLocaleDateString("es-CL"))}
      ${row("Creado por", task.createdBy?.username)}
      ${task.editedBy ? row("Editado por", task.editedBy?.username) : ""}
    </table>
  </div>

  ${note("Motivo de Ingreso", task.motivoIngreso, "#38bdf8")}
  ${note("Diagnóstico Taller", task.diagnosticoTaller, "#6366f1")}
  ${note("Descripción de Reparación / Cambio de Piezas", task.repairDescription, "#4ade80")}
  ${note("Observaciones Generales", task.description, "#fb923c")}

  <div class="footer">
    <span>TallerData — Software para Taller Mecánico</span>
    <span>Orden #${task.orderNumber} · ${new Date().toLocaleDateString("es-CL")}</span>
  </div>

</body>
</html>`;
}

router.post("/pdf/order", authRequired, async (req, res) => {
  const task = req.body;
  if (!task || !task.orderNumber) {
    return res.status(400).json({ message: "Datos de orden inválidos" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(buildHTML(task), { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    const clientFull = `${task.clientNombres || ""} ${task.clientApellidos || ""}`.trim() || "cliente";
    const filename = `orden_${task.orderNumber}_${clientFull.replace(/\s+/g, "_")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error("Error generando PDF:", error);
    res.status(500).json({ message: "Error generando PDF: " + error.message });
  }
});

export default router;
