// pages/api/create-thumbnail.js
import formidable from "formidable"

// ⛔ Importante: desactivar el bodyParser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  // Configuración del parser
  const form = formidable({
    multiples: true,          // soportar múltiples archivos
    uploadDir: "/tmp",        // carpeta temporal (puedes cambiarla)
    keepExtensions: true,     // mantener extensión original
  })

  try {
    // Parsear los datos recibidos en multipart/form-data
    const [fields, files] = await form.parse(req)

    console.log("📩 Campos recibidos:", fields) // texto: description, category, etc.
    console.log("📂 Archivos recibidos:", files) // archivos: videoFile, referenceImages...

    // Responder con lo recibido
    return res.status(200).json({
      message: "Formulario procesado correctamente ✅",
      fields,
      files,
    })
  } catch (error) {
    console.error("❌ Error procesando el formulario:", error)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}
