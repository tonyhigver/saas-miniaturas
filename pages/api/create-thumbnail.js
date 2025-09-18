// pages/api/create-thumbnail.js
import formidable from "formidable";
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

  // Configuración de formidable solo para texto
  const form = formidable({
    multiples: false, // No se esperan archivos
  });

  // Promesa para parsear el form
  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else resolve(fields);
      });
    });

  try {
    const fields = await parseForm(req);

    // 🔍 Depuración: mostrar qué se recibe
    console.log("📩 Campos recibidos:", fields || {});

    // ----- REENVÍO AL BACKEND -----
    const formData = new FormData();

    // Agregar solo campos de texto
    for (const key in fields) {
      if (Array.isArray(fields[key])) {
        fields[key].forEach((val) => formData.append(key, val));
      } else {
        formData.append(key, fields[key]);
      }
    }

    // 🔍 Depuración: mostrar lo que se enviará al backend
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
