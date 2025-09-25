// /pages/api/ctr-dinamico/activate.js (Frontend)
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" })
  }

  try {
    const session = await getSession({ req })
    if (!session) return res.status(401).json({ error: "No autenticado" })

    const backend = process.env.BACKEND_URL || "http://localhost:3001"

    // Pasar token al backend si es necesario
    const r = await fetch(`${backend}/ctr/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ userEmail: session.user.email }),
    })

    const data = await r.json()
    res.status(r.ok ? 200 : r.status).json(data)
  } catch (err) {
    console.error("Error al activar CTR Dinámico:", err)
    res.status(500).json({
      error: "Error al activar CTR Dinámico",
      details: err.message,
    })
  }
}
