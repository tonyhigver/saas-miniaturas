// pages/api/create-thumbnail.js
import formidable from "formidable"
import fs from "fs"
import fetch from "node-fetch"

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
    uploadDir: "/tmp",        // carpeta temporal
    keepExtensions: true,     // mantener extensión original
  })

  try {
    // Parsear los datos recibidos en multipart/form-data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    console.log("📩 Campos recibidos en Vercel:", fields)
    console.log("📂 Archivos recibidos en Vercel:", files)

    // ----- REENVÍO AL BACKEND EN HETZNER -----
    const { FormData } = await import("formdata-node")
    const formData = new FormData()

    // Agregar campos de texto
    for (const key in fields) {
      formData.append(key, fields[key])
    }

    // Agregar archivos (videoFile, referenceImages, etc.)
    for (const key in files) {
      const file = files[key]
      if (Array.isArray(file)) {
        file.forEach(f => {
          formData.append(key, fs.createReadStream(f.filepath), f.originalFilename)
        })
      } else {
        formData.append(key, fs.createReadStream(file.filepath), file.originalFilename)
      }
    }

    // Enviar al backend de Hetzner
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
    })

    const backendData = await backendRes.json()

    return res.status(200).json({
      message: "Formulario reenviado al backend ✅",
      backendResponse: backendData,
    })
  } catch (error) {
    console.error("❌ Error procesando y reenviando el formulario:", error)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}
