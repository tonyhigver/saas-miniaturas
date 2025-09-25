// pages/ctr-dinamico.js
import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"

function VideoStats({ video }) {
  const views = video.viewsLastWeek || 0

  return (
    <div className="p-4 border rounded-lg bg-gray-200 text-black mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>Visualizaciones últimas 7 días: {views}</p>
      <div className="mt-4 space-x-2">
        <button
          className="bg-blue-300 px-4 py-2 rounded text-black hover:bg-blue-400"
          onClick={() => alert("Cambiar miniatura")}
        >
          Cambiar miniatura
        </button>
        <button
          className="bg-green-300 px-4 py-2 rounded text-black hover:bg-green-400"
          onClick={() => alert("Cambiar título")}
        >
          Cambiar título
        </button>
      </div>
    </div>
  )
}

function VideoSelector({ videos, selectedVideo, setSelectedVideo, period, setPeriod }) {
  return (
    <div className="mt-6 p-4 border rounded-xl shadow bg-gray-100 text-black">
      <h2 className="text-lg font-bold mb-2">Tus videos recientes</h2>

      <label className="block mb-2">
        Mostrar videos de:
        <select
          className="ml-2 p-1 rounded text-black"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
        </select>
      </label>

      <select
        className="w-full p-2 border rounded mb-4 text-black"
        value={selectedVideo?.id || ""}
        onChange={(e) =>
          setSelectedVideo(videos.find((v) => v.id === e.target.value))
        }
      >
        <option value="">Selecciona un video</option>
        {videos.map((video) => (
          <option key={video.id} value={video.id}>
            {video.title}
          </option>
        ))}
      </select>

      {selectedVideo && <VideoStats video={selectedVideo} />}
    </div>
  )
}

export default function CtrDinamico() {
  const { data: session } = useSession()
  const [isActivated, setIsActivated] = useState(false)
  const [intervalHours, setIntervalHours] = useState(24)
  const [intervalMinutes, setIntervalMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showMainMenu, setShowMainMenu] = useState(true)

  // 🔹 Estado centralizado de videos
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [period, setPeriod] = useState("week")

  // 🔹 Traer estado inicial y videos del backend
  useEffect(() => {
    if (!session) return
    async function fetchData() {
      try {
        const res = await fetch("/api/ctr-dinamico/status")
        const data = await res.json()
        setIsActivated(data.isActivated)
        if (data.isActivated) setShowMainMenu(false)
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos)
          setSelectedVideo(data.videos[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session])

  // 🔹 Refetch de videos cuando cambia el periodo o vuelve visible la pestaña
  useEffect(() => {
    if (!isActivated) return
    async function fetchVideos() {
      try {
        const res = await fetch(`/api/ctr-dinamico/videos?period=${period}`)
        const data = await res.json()
        setVideos(data)
        if (!selectedVideo && data.length > 0) setSelectedVideo(data[0])
      } catch (err) {
        console.error(err)
      }
    }
    fetchVideos()

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchVideos()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [period, isActivated])

  async function handleActivate() {
    if (!session) {
      signIn("google")
      return
    }
    try {
      const res = await fetch("/api/ctr-dinamico/activate", { method: "POST" })
      if (!res.ok) throw new Error("No se pudo activar CTR Dinámico")
      setIsActivated(true)
      setShowMainMenu(false)
    } catch (err) {
      console.error(err)
      alert("Error al activar CTR Dinámico")
    }
  }

  async function handleSaveSettings() {
    const body = { intervalHours, intervalMinutes }
    await fetch("/api/ctr-dinamico/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    alert("Configuración guardada ✅")
  }

  if (loading) return <p className="p-4 text-black">Cargando...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-4">CTR Dinámico</h1>

      {session?.error && (
        <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-200 text-black rounded flex justify-between items-center">
          <span>⚠️ Error con el token de Google. Vuelve a iniciar sesión.</span>
          <button
            onClick={() => signIn("google")}
            className="ml-4 bg-blue-300 text-black px-3 py-1 rounded hover:bg-blue-400"
          >
            Reintentar
          </button>
        </div>
      )}

      {showMainMenu ? (
        <div className="border rounded-xl p-6 shadow bg-gray-200 text-black">
          <p className="mb-4">
            Aún no has activado el sistema de CTR Dinámico para tus videos.
          </p>
          <button
            onClick={handleActivate}
            className="bg-blue-300 text-black px-4 py-2 rounded-xl shadow hover:bg-blue-400"
          >
            Empezar 🚀
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowMainMenu(true)}
            className="mb-4 text-black font-bold bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
          >
            ← Volver
          </button>

          <div className="border rounded-xl p-6 shadow bg-gray-200 text-black">
            <h2 className="text-lg font-semibold mb-2">Configuración</h2>
            <label className="block mb-2">
              Intervalo de revisión:
              <div className="flex space-x-2 mt-2">
                <input
                  type="number"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="w-20 border rounded p-1 text-black"
                />
                <span>horas</span>
                <input
                  type="number"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="w-20 border rounded p-1 text-black"
                />
                <span>minutos</span>
              </div>
            </label>
            <button
              onClick={handleSaveSettings}
              className="mt-3 bg-green-300 text-black px-4 py-2 rounded-xl shadow hover:bg-green-400"
            >
              Guardar cambios
            </button>
          </div>

          <VideoSelector
            videos={videos}
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
            period={period}
            setPeriod={setPeriod}
          />
        </>
      )}
    </div>
  )
}
