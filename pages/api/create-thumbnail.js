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

    // --- 2) Extraer cabeceras personalizadas (texto enviado desde el cliente) ---
    // 💡 Aquí asumo que el frontend envía los campos en headers como JSON o algo similar.
    // Si los mandas en otra parte, ajustamos.
    let fields = {};
    if (req.headers["x-fields"]) {
      try {
        fields = JSON.parse(req.headers["x-fields"]);
      } catch (e) {
        console.warn("⚠️ No se pudo parsear x-fields como JSON");
      }
    }

    console.log("✅ Campos de texto recibidos:", fields);

    // --- 3) Crear FormData con texto + archivo ---
    const formData = new FormData();

    // Añadir texto
    for (const key in fields) {
      formData.append(key, fields[key]);
    }

    // Añadir archivo binario (imagen/video)
    formData.append("file", buffer, {
      filename: req.headers["x-file-name"] || "upload.bin",
      contentType: req.headers["content-type"] || "application/octet-stream",
    });

    // --- 4) Reenviar al backend ---
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario y archivo enviados correctamente ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando el formulario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
