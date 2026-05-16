import axios from "../api/axios";

export async function generateOrderPDF(task) {
  try {
    const response = await axios.post("/pdf/order", task, {
      responseType: "blob",
      withCredentials: true,
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const clientName = `${task.clientNombres || ""}_${task.clientApellidos || ""}`.trim().replace(/\s+/g, "_") || "cliente";
    const a = document.createElement("a");
    a.href = url;
    a.download = `orden_${task.orderNumber}_${clientName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    alert("Error al generar el PDF: " + (error.response?.data?.message || error.message));
  }
}
