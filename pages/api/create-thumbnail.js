// pages/api/create-thumbnail.js
import FormData from "form-data";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js para recibir FormData
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("⚠️ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    console.log("📩 Recibiendo petición /api/create-thumbnail desde frontend...");

    // --- 1) Leer request completo como buffer ---
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    console.log(`📦 Buffer recibido (${buffer.length} bytes)`);

    // --- 2) Reenviar buffer al backend sin procesar ---
    console.log("⏳ Reenviando datos al backend en Hetzner...");
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: buffer, // reenviamos todo el FormData
      headers: {
        "content-type": req.headers["content-type"], // preserva multipart/form-data con boundary
      },
    });

    // --- 3) Leer respuesta del backend ---
    const backendData = await backendRes.json();
    console.log("✅ Respuesta del backend recibida:", backendData);

    // --- 4) Responder al frontend ---
    res.status(200).json({
      message: "Formulario y archivos enviados correctamente ✅",
      backendResponse: backendData,
    });
    console.log("📤 Respuesta enviada al frontend ✅");
  } catch (error) {
    console.error("❌ Error procesando /api/create-thumbnail:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
