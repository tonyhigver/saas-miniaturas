// pages/api/create-thumbnail.js
import formidable from "formidable";
import fs from "fs";
import os from "os";
import { FormData } from "formdata-node";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Configurar formidable
  const form = formidable({
    multiples: true,              // Permitir múltiples archivos
    uploadDir: os.tmpdir(),       // Directorio temporal seguro en Vercel
    keepExtensions: true,         // Mantener extensión de archivos
    maxFileSize: 200 * 1024 * 1024, // 200MB máximo por archivo
  });

  // Promesa para parsear el form
  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { fields, files } = await parseForm(req);

    // 🔍 Logs para depuración
    console.log("📩 Campos recibidos:", fields);
    console.log("📂 Archivos recibidos:", files);

    // ----- REENVÍO AL BACKEND (ejemplo Hetzner) -----
    const formData = new FormData();

    // Agregar campos de texto
    for (const key in fields) {
      if (Array.isArray(fields[key])) {
        fields[key].forEach((val) => formData.append(key, val));
      } else {
        formData.append(key, fields[key]);
      }
    }

    // Agregar archivos
    for (const key in files) {
      const file = files[key];
      if (!file) continue;

      if (Array.isArray(file)) {
        file.forEach((f) => {
          formData.append(key, fs.createReadStream(f.filepath), f.originalFilename);
        });
      } else {
        formData.append(key, fs.createReadStream(file.filepath), file.originalFilename);
      }
    }

    // 🔍 Log de lo que se reenvía al backend
    for (let pair of formData.entries()) {
      console.log("🔄 Reenviando al backend:", pair[0], pair[1]);
    }

    // Enviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
    });

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario recibido y reenviado ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando el formulario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
