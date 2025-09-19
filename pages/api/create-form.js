// pages/api/create-thumbnail.js
import formidable from "formidable";
import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import fetch from "node-fetch";
import fs from "fs";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Configuración de formidable para texto + archivos
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      let fieldsCollected = {};
      let filesCollected = {};

      form.on("field", (name, value) => {
        console.log("📩 Campo recibido:", name, value);
      });

      form.on("file", (name, file) => {
        console.log("📂 Archivo recibido:", name, file.originalFilename);
      });

      form.on("error", (err) => {
        console.error("❌ Error de Formidable:", err);
        reject(err);
      });

      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else {
          console.log("✅ Campos parseados:", fields);
          console.log("✅ Archivos parseados:", files);
          resolve({ fields, files });
        }
      });
    });

  try {
    const { fields, files } = await parseForm(req);

    // Creamos el FormData que se enviará al backend
    const formData = new FormData();

    // Añadir campos de texto
    for (const key in fields) {
      if (Array.isArray(fields[key]) && fields[key].length === 1) {
        formData.append(key, fields[key][0]);
      } else {
        formData.append(key, fields[key]);
      }
    }

    // Añadir archivos (ej. imagen de caras)
    for (const key in files) {
      const file = files[key];
      if (Array.isArray(file)) {
        for (const f of file) {
          formData.append(key, await fileFromPath(f.filepath));
        }
      } else {
        formData.append(key, await fileFromPath(file.filepath));
      }
    }

    // Mostrar lo que se va a enviar al backend
    for (const pair of formData.entries()) {
      console.log("🔄 Reenviando al backend:", pair[0], pair[1]);
    }

    // Enviar al backend como multipart/form-data
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
    });

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario con texto e imagen recibido y reenviado ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando el formulario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
