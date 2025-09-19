// pages/api/create-thumbnail.js
import multiparty from "next-multiparty";
import { FormData } from "formdata-node";
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
    const form = await multiparty(req);

    const fields = form.fields; // { description: ["Texto"], titleColor: ["#FF0000"], ... }
    const files = form.files;   // { facesImage: [{ filepath, originalFilename, mimetype }] }

    console.log("📩 Campos recibidos:", fields);
    console.log("📂 Archivos recibidos:", files);

    // Preparar FormData si hay archivos, si no enviar JSON
    let bodyToSend;
    let headers = {};

    const hasFiles = files && Object.keys(files).length > 0;

    if (hasFiles) {
      bodyToSend = new FormData();

      // Añadir campos de texto
      for (const key in fields) {
        fields[key].forEach((val) => bodyToSend.append(key, val));
      }

      // Añadir archivos
      for (const key in files) {
        files[key].forEach((file) => {
          const fileData = fs.readFileSync(file.filepath);
          bodyToSend.append(key, new Blob([fileData], { type: file.mimetype }), file.originalFilename);
        });
      }
    } else {
      // Solo texto: enviar JSON
      bodyToSend = {};
      for (const key in fields) {
        bodyToSend[key] = fields[key].length === 1 ? fields[key][0] : fields[key];
      }
      bodyToSend = JSON.stringify(bodyToSend);
      headers["Content-Type"] = "application/json";
    }

    console.log("🔄 Datos a enviar al backend:", hasFiles ? "FormData con archivos" : bodyToSend);

    // Enviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      headers,
      body: bodyToSend,
    });

    const backendData = await backendRes.json();

    return res.status(200).json({
      message: "Formulario recibido y reenviado ✅",
      backendResponse: backendData,
    });

  } catch (err) {
    console.error("❌ Error procesando el formulario:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
