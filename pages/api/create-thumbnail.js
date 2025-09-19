// pages/api/create-thumbnail.js
import formidable from "formidable";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

// 📌 Función auxiliar para parsear SOLO campos de texto
const parseTextFields = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      filter: () => false, // 🚫 Ignora archivos
    });

    const fieldsData = {};

    form.on("field", (name, value) => {
      console.log("🔹 Campo recibido:", name, value);
      fieldsData[name] = value;
    });

    form.on("error", (err) => {
      console.error("❌ Error en formidable:", err);
      reject(err);
    });

    form.parse(req, (err) => {
      if (err) reject(err);
      else {
        console.log("✅ Campos parseados:", fieldsData);
        resolve(fieldsData);
      }
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // 1️⃣ Parsear solo campos de texto
    const fields = await parseTextFields(req);

    // 2️⃣ Normalizar datos en un JSON limpio
    const jsonPayload = {};
    for (const key in fields) {
      if (Array.isArray(fields[key]) && fields[key].length === 1) {
        jsonPayload[key] = fields[key][0];
      } else {
        jsonPayload[key] = fields[key];
      }
    }

    console.log("🔄 JSON a enviar al backend:", jsonPayload);

    // 3️⃣ Reenviar los datos al backend
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
