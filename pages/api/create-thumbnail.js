// pages/api/create-thumbnail.js
import formidable from "formidable";
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

  // --- 1) Parsear solo los campos de texto con formidable ---
  const form = formidable({ multiples: false });

  const parseFields = (req) =>
    new Promise((resolve, reject) => {
      form.on("field", (name, value) => {
        console.log("🔹 Campo recibido:", name, value);
      });

      form.on("error", (err) => reject(err));

      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else resolve(fields);
      });
    });

  try {
    // ⚡ Paso 1: extraer campos de texto
    const fields = await parseFields(req);

    const jsonPayload = {};
    for (const key in fields) {
      if (Array.isArray(fields[key]) && fields[key].length === 1) {
        jsonPayload[key] = fields[key][0];
      } else {
        jsonPayload[key] = fields[key];
      }
    }
    console.log("✅ Campos de texto parseados:", jsonPayload);

    // ⚡ Paso 2: leer request entero como buffer (para archivos)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // ⚡ Paso 3: crear FormData con texto + archivos
    const formData = new FormData();

    // Añadir texto
    for (const key in jsonPayload) {
      formData.append(key, jsonPayload[key]);
    }

    // Añadir archivos (video o imagen)
    formData.append("file", buffer, {
      filename: req.headers["x-file-name"] || "upload.bin",
      contentType: req.headers["content-type"] || "application/octet-stream",
    });

    // ⚡ Paso 4: enviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
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
