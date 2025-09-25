// pages/ctr-dinamico.js
import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"

// 🔹 Componentes adicionales
function VideoStats({ video }) {
  const views = video.viewsLastWeek || 0

  return (
    <div className="p-4 border rounded-lg bg-gray-800 mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>Visualizaciones últimas 7 días: {views}</p>

      <div className="mt-4 space-x-2">
        <button
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          onClick={() => alert("Aquí llamarías a tu backend para cambiar miniatura")}
        >
          Cambiar miniatura
        </button>
        <button
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
          onClick={() => alert("Aquí llamarías a tu backend para cambiar título")}
        >
          Cambiar título
        </button>
      </div>
    </div>
  )
}

function VideoSelector({ accessToken }) {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [period, setPeriod] = useState("week")

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch(`/api/ctr-dinamico/videos?period=${period}`)
      const data = await res.json()
      setVideos(data)
    }
    fetchVideos()
  }, [period])

  return (
    <div className="mt-6 p-4 border rounded-xl shadow bg-gray-900">
      <h2 className="text-lg font-bold mb-2">Tus videos recientes</h2>

      <label className="block mb-2">
        Mostrar videos de:
        <select
          className="ml-2 p-1 rounded"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
        </select>
      </label>

      <select
        className="w-full p-2 border rounded mb-4"
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
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔹 Traer estado inicial del backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ctr-dinamico/status")
        const data = await res.json()
        setIsActivated(data.isActivated)
        setVideos(data.videos || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchData()
  }, [session])

  // 🔹 Activar por primera vez
  async function handleActivate() {
    if (!session) {
      signIn("google")
      return
    }

    const res = await fetch("/api/ctr-dinamico/activate", { method: "POST" })
    if (res.ok) setIsActivated(true)
  }

  // 🔹 Guardar cambios de intervalo
  async function handleSaveSettings() {
    const body = { intervalHours, intervalMinutes }
    await fetch("/api/ctr-dinamico/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    alert("Configuración guardada ✅")
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CTR Dinámico</h1>

      {/* 🔹 Aviso de error de token */}
      {session?.error && (
        <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>
            ⚠️ Error con el token de Google. Por favor, vuelve a iniciar sesión.
          </span>
          <button
            onClick={() => signIn("google")}
            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isActivated ? (
        <div className="border rounded-xl p-6 shadow">
          <p className="mb-4">
            Aún no has activado el sistema de CTR Dinámico para tus videos.
          </p>
          <button
            onClick={handleActivate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
          >
            Empezar 🚀
          </button>
        </div>
      ) : (
        <>
          {/* Configuración de intervalos */}
          <div className="border rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Configuración</h2>
            <label className="block mb-2">
              Intervalo de revisión:
              <div className="flex space-x-2 mt-2">
                <input
                  type="number"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="w-20 border rounded p-1"
                />
                <span>horas</span>
                <input
                  type="number"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="w-20 border rounded p-1"
                />
                <span>minutos</span>
              </div>
            </label>
            <button
              onClick={handleSaveSettings}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700"
            >
              Guardar cambios
            </button>
          </div>

          {/* Lista de videos y selección avanzada */}
          {isActivated && <VideoSelector accessToken={session.accessToken} />}
        </>
      )}
    </div>
  )
}
