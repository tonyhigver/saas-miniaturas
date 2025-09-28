"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
// 🔹 Ruta relativa a ViewsChart
import ViewsChart from "../components/ViewsChart"

// Placeholder para miniaturas, puedes reemplazar con tu componente real
function ThumbnailsComponent() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Crear miniaturas</h2>
      <p>Aquí iría tu UI para cambiar miniaturas o títulos.</p>
    </div>
  )
}

export default function CtrDinamico() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState(null) // null → pantalla inicial

  // 🔹 Cargar videos
  useEffect(() => {
    if (!session) return
    let isMounted = true

    async function fetchVideos() {
      try {
        const res = await fetch(`/api/ctr-dinamico/videos`)
        const data = await res.json()
        if (!isMounted) return

        setVideos(data)
        if (!selectedVideo && data.length > 0) setSelectedVideo(data[0])
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchVideos()
    return () => { isMounted = false }
  }, [session])

  if (!session) {
    return (
      <div className="p-8">
        <p>No estás autenticado.</p>
        <button
          className="bg-blue-300 px-4 py-2 rounded"
          onClick={() => signIn("google")}
        >
          Iniciar sesión con Google
        </button>
      </div>
    )
  }

  if (loading) return <p className="p-4">Cargando...</p>

  // 🔹 Pantalla inicial: elegir modo
  if (!mode) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Selecciona una opción</h1>
        <div className="flex justify-center gap-4">
          <button
            className="bg-blue-300 px-6 py-3 rounded hover:bg-blue-400"
            onClick={() => setMode("charts")}
          >
            Ver gráficos
          </button>
          <button
            className="bg-green-300 px-6 py-3 rounded hover:bg-green-400"
            onClick={() => setMode("thumbnails")}
          >
            Crear miniaturas
          </button>
        </div>
      </div>
    )
  }

  // 🔹 Modo miniaturas
  if (mode === "thumbnails") return <ThumbnailsComponent />

  // 🔹 Modo charts
  if (mode === "charts") {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">CTR Dinámico</h1>

        <div className="mb-4">
          <label className="mr-2">Selecciona un video:</label>
          <select
            value={selectedVideo?.id || ""}
            onChange={e => setSelectedVideo(videos.find(v => v.id === e.target.value))}
            className="border p-2 rounded"
          >
            {videos.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
        </div>

        {selectedVideo && (
          <ViewsChart userId={session.user.id} videoId={selectedVideo.id} />
        )}
      </div>
    )
  }

  return null
}
