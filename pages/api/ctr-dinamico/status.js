// pages/api/ctr-dinamico/status.js

export default async function handler(req, res) {
  try {
    // Simulación de estado, luego conecta con tu backend real
    const data = {
      isActivated: false, // o true si ya está activado
      videos: [
        { id: "1", title: "Video de prueba 1", ctr: 45 },
        { id: "2", title: "Video de prueba 2", ctr: 60 },
      ],
    }

    res.status(200).json(data)
  } catch (error) {
    console.error("Error en /api/ctr-dinamico/status:", error)
    res.status(500).json({ error: "Error al obtener estado CTR Dinámico" })
  }
}
