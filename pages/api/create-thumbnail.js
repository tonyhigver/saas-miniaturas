// pages/api/create-thumbnail.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: true });

  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      const fields = {};
      const files = {};

      form.on("field", (name, value) => {
        console.log("🔹 Campo recibido:", name, value);
        fields[name] = value;
      });

      form.on("file", (name, file) => {
        console.log("📎 Archivo recibido:", name, file.originalFilename);
        files[name] = file;
      });

      form.on("error", (err) => {
        console.error("❌ Error de Formidable:", err);
        reject(err);
      });

      form.parse(req, () => resolve({ fields, files }));
    });

  try {
    const { fields, files } = await parseForm(req);

    console.log("✅ Campos parseados:", fields);
    console.log("✅ Archivos parseados:", files);

    // Crear FormData para reenviar al backend
    const formData = new (require("formdata-node").FormData)();

    // Agregar campos de texto
    for (const key in fields) {
      formData.append(key, fields[key]);
    }

    // Agregar archivos
    for (const key in files) {
      const file = files[key];
      formData.append(
        key,
        fs.createReadStream(file.filepath),
        file.originalFilename
      );
    }

    // Enviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders ? formData.getHeaders() : {}, // Node-fetch necesita headers de multipart
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
