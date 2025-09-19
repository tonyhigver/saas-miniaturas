// pages/api/create-thumbnail.js
import multiparty from "multiparty";
import FormData from "form-data";
import fetch from "node-fetch";
import fs from "fs";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

// Función auxiliar para parsear multiparty usando promesas
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    // Opcional: establecer límite de tamaño de archivo
    form.maxFilesSize = 10 * 1024 * 1024; // 10 MB por archivo

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      // Normalizar campos y archivos
      const normalizedFields = {};
      const normalizedFiles = {};

      for (const key in fields) {
        normalizedFields[key] = fields[key].length === 1 ? fields[key][0] : fields[key];
      }

      for (const key in files) {
        normalizedFiles[key] = files[key];
      }

      resolve({ fields: normalizedFields, files: normalizedFiles });
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Parsear el formulario
    const { fields, files } = await parseForm(req);

    console.log("📩 Campos recibidos:", fields);
    console.log("📂 Archivos recibidos:", files);

    // Crear FormData para reenviar al backend
    const formData = new FormData();

    // Añadir campos de texto
    for (const key in fields) {
      const value = fields[key];
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    }

    // Añadir archivos
    for (const key in files) {
      files[key].forEach((file) => {
        // Asegurarse que el archivo existe
        if (fs.existsSync(file.path)) {
          formData.append(
            key,
            fs.createReadStream(file.path),
            { filename: file.originalFilename, contentType: file.headers["content-type"] }
          );
        } else {
          console.warn(`⚠ Archivo no encontrado: ${file.path}`);
        }
      });
    }

    console.log("🔄 Reenviando datos al backend...");

    // Enviar datos al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    // Validar respuesta del backend
    if (!backendRes.ok) {
      const text = await backendRes.text();
      console.error("❌ Error del backend:", text);
      return res.status(500).json({ error: "Error en el backend", details: text });
    }

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario recibido y reenviado ✅",
      backendResponse: backendData,
    });
  } catch (err) {
    console.error("❌ Error procesando el formulario:", err);
    return res.status(500).json({ error: "Error en el servidor", details: err.message });
  }
}
