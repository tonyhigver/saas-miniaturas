// pages/api/ctr-dinamico/status.js

import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  try {
    // 🔹 Obtener sesión del usuario
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: "No autenticado" })

    // 🔹 Estado real de CTR Dinámico
    // Aquí puedes conectar con tu backend o DB para obtener isActivated
    const data = {
      isActivated: false, // Cambia a true si el usuario ya activó CTR Dinámico
      videos: [], // ✅ Array vacío, los videos se obtendrán desde /videos
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error en /api/ctr-dinamico/status:", error)
    res.status(500).json({ error: "Error al obtener estado CTR Dinámico" })
  }
}
