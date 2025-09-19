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

  // Configuración de formidable solo para campos de texto
  const form = formidable({ multiples: false });

  const parseForm = (req) =>
    new Promise((resolve, reject) => {
      // Depuración: mostrar cada campo recibido
      form.on("field", (name, value) => {
        console.log("🔹 Campo recibido:", name, value);
      });

      form.on("error", (err) => {
        console.error("❌ Error de Formidable:", err);
        reject(err);
      });

      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else {
          console.log("✅ Todos los campos parseados:", fields);
          resolve(fields);
        }
      });
    });

  try {
    const fields = await parseForm(req);

    // Convertimos todo a JSON limpio antes de reenviar
    const jsonPayload = {};
    for (const key in fields) {
      // Si es un array con un solo valor, convertir a string
      if (Array.isArray(fields[key]) && fields[key].length === 1) {
        jsonPayload[key] = fields[key][0];
      } else {
        jsonPayload[key] = fields[key];
      }
    }

    console.log("🔄 JSON a enviar al backend:", jsonPayload);

    // Enviar al backend como JSON
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonPayload),
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