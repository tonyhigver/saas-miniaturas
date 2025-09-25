// /pages/api/ctr-dinamico/activate.js
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    // Obtener sesión del usuario
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: "No autenticado" })

    // 🔹 Aquí ya no hay fetch a localhost
    // Solo logueamos o guardamos en DB si quieres
    console.log("Usuario activó CTR Dinámico:", session.user.email)

    // Respuesta exitosa
    res.status(200).json({ success: true })
  } catch (err) {
    console.error("Error al activar CTR Dinámico:", err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}
