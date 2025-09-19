// pages/api/create-thumbnail.js
import multiparty from "multiparty";
import FormData from "form-data";
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

  try {
    // Parsear formulario (texto + archivos)
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Error parseando formulario:", err);
        return res.status(500).json({ error: "Error parseando formulario" });
      }

      console.log("📩 Campos recibidos:", fields);
      console.log("📂 Archivos recibidos:", files);

      // Crear FormData para reenviar al backend
      const formData = new FormData();

      // Añadir campos de texto
      for (const key in fields) {
        fields[key].forEach((val) => formData.append(key, val));
      }

      // Añadir archivos (stream directo)
      for (const key in files) {
        files[key].forEach((file) => {
          formData.append(
            key,
            fs.createReadStream(file.path),
            { filename: file.originalFilename, contentType: file.headers["content-type"] }
          );
        });
      }

      console.log("🔄 Reenviando datos al backend...");

      // Enviar al backend
      const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // importante para multipart/form-data
      });

      const backendData = await backendRes.json();

      return res.status(200).json({
        message: "Formulario recibido y reenviado ✅",
        backendResponse: backendData,
      });
    });
  } catch (err) {
    console.error("❌ Error procesando el formulario:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
