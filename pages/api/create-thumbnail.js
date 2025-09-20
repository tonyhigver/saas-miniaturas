// pages/api/create-thumbnail.js
import FormData from "form-data";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // --- 1) Leer request completo como buffer ---
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // --- 2) Crear FormData ---
    const formData = new FormData();

    // ⚡ Importante: aquí asumimos que el frontend manda todo como FormData
    // con "file" para archivos y otros campos de texto como "description", "titleText", etc.

    // Extraemos los campos de texto desde el buffer usando "form-data-parser" simple
    // o los definimos en frontend; aquí asumimos que el frontend ya envía FormData correcto.
    // Si quieres, el backend puede simplemente reenviar todo como "file" + texto.

    // --- 3) Reenviar al backend ---
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: buffer, // reenviamos el buffer tal cual, incluyendo el FormData completo
      headers: {
        "content-type": req.headers["content-type"], // preserva multipart/form-data boundary
      },
    });

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario y archivos enviados correctamente ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando el formulario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
