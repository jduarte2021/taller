/**
 * PDF Generator - TallerData
 * Delega la generación al backend (Puppeteer).
 * El frontend solo envía los datos y descarga el archivo resultante.
 */
export async function generateOrderPDF(task) {
  try {
    const response = await fetch("/api/pdf/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orden_${task.orderNumber}_${(task.clientName || "cliente").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    alert("Error al generar el PDF: " + error.message);
  }
}
