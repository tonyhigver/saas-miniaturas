// pages/api/ctr-dinamico/status.js
import { getSession } from "next-auth/react"
import { createClient } from "@supabase/supabase-js"

// 🔹 Inicializa Supabase con Service Role Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // 🔹 Obtener sesión del usuario
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: "No autenticado" })

    // 🔹 Verificar si el usuario tiene activado CTR Dinámico
    const { data: user, error } = await supabase
      .from("users")
      .select("id, youtube_refresh_token")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("❌ Error obteniendo usuario:", error)
      return res.status(500).json({ error: "Error obteniendo usuario" })
    }

    // 🔹 Si tiene refresh token, consideramos CTR Dinámico activado
    const isActivated = !!user?.youtube_refresh_token

    // 🔹 No devolvemos videos aquí; el frontend llamará a /videos
    res.status(200).json({
      isActivated,
      videos: []
    })
  } catch (error) {
    console.error("Error en /api/ctr-dinamico/status:", error)
    res.status(500).json({ error: "Error al obtener estado CTR Dinámico" })
  }
}
