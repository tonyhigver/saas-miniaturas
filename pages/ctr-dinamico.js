"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import ViewsChart from "../components/ViewsChart"

// Componente miniaturas debajo del gráfico
function ThumbnailsComponent() {
  return (
    <div className="mt-4 p-4 border border-[#00ffff] rounded-lg text-[#00ffff] text-center">
      <h2 className="text-xl font-bold mb-2">Crear nueva miniatura</h2>
      <button
        className="border border-[#00ffff] px-4 py-2 rounded hover:bg-[#00ffff] hover:text-black transition"
        onClick={() => alert("Aquí iría la funcionalidad de crear miniatura")}
      >
        Cambiar miniatura
      </button>
    </div>
  )
}

export default function CtrDinamico() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Cargar videos del canal
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
      <div className="p-8 text-center">
        <p className="text-[#00ffff] mb-4 font-bold">No estás autenticado.</p>
        <button
          className="border border-[#00ffff] px-4 py-2 rounded hover:bg-[#00ffff] hover:text-black"
          onClick={() => signIn("google")}
        >
          Iniciar sesión con Google
        </button>
      </div>
    )
  }

  if (loading) return <p className="p-4 text-[#00ffff]">Cargando...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto border border-[#00ffff] rounded-xl text-[#00ffff]">
      <h1 className="text-2xl font-bold mb-4 text-center">CTR Dinámico</h1>

      {/* Selector de video */}
      <div className="mb-4 text-center">
        <label className="mr-2 font-medium">Selecciona un video:</label>
        <select
          value={selectedVideo?.id || ""}
          onChange={e => setSelectedVideo(videos.find(v => v.id === e.target.value))}
          className="border border-[#00ffff] px-2 py-1 rounded bg-transparent text-[#00ffff]"
        >
          {videos.map(v => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </select>
      </div>

      {/* Gráfico de views y miniaturas */}
      {selectedVideo && (
        <>
          <ViewsChart userId={session.user.id} videoId={selectedVideo.id} />
          <ThumbnailsComponent />
        </>
      )}
    </div>
  )
}
