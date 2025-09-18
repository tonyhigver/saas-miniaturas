// pages/api/create-thumbnail.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    // Como enviamos FormData, necesitamos procesarlo
    // Si solo quieres ver qué llega, haz esto:
    const data = req.body
    console.log("📩 Datos recibidos en API:", data)

    // De momento respondemos con lo recibido
    return res.status(200).json({ message: "Formulario recibido", data })
  } catch (error) {
    console.error("❌ Error en API:", error)
    return res.status(500).json({ error: "Error en el servidor" })
  }
}
