// pages/ctr-dinamico.js
import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

// 🔹 Componente para mostrar estadísticas y gráfico interactivo
function VideoStats({ video, period }) {
  const viewsTotal =
    period === "week" ? video.totalViewsWeek : video.totalViewsMonth

  const records = video.viewsByDay || []

  // 🔹 Generar todos los intervalos de 6h desde el primer registro hasta ahora
  let chartData = []
  if (records.length > 0) {
    const firstDate = new Date(records[0].timestamp)
    const lastDate = new Date(records[records.length - 1].timestamp)

    // normalizar inicio al múltiplo de 6h más cercano hacia atrás
    firstDate.setMinutes(0, 0, 0)
    firstDate.setHours(Math.floor(firstDate.getHours() / 6) * 6)

    // normalizar fin al múltiplo de 6h hacia adelante
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(Math.floor(now.getHours() / 6) * 6)

    let pointer = new Date(firstDate)
    let lastViews = 0

    while (pointer <= now) {
      // buscar el último registro <= al bloque actual
      const relevant = records.filter(
        (r) => new Date(r.timestamp) <= pointer
      )
      const currentViews =
        relevant.length > 0 ? relevant[relevant.length - 1].views : lastViews

      const increment = currentViews - lastViews
      lastViews = currentViews

      chartData.push({
        interval: `${pointer.getDate()}/${pointer.getMonth() + 1} ${String(
          pointer.getHours()
        ).padStart(2, "0")}:00`,
        views: increment > 0 ? increment : 0,
      })

      pointer.setHours(pointer.getHours() + 6)
    }
  }

  // 🔹 Línea temporal (último bloque incompleto)
  let lastTemporaryLabel = null
  if (records.length > 0) {
    const lastRec = records[records.length - 1]
    const lastDate = new Date(lastRec.timestamp)
    if (!isNaN(lastDate)) {
      const lastIntervalHour = Math.floor(lastDate.getHours() / 6) * 6
      const nextHour = lastIntervalHour + 6
      lastTemporaryLabel = `${lastDate.getDate()}/${
        lastDate.getMonth() + 1
      } ${String(nextHour).padStart(2, "0")}:00`
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-200 text-black mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>
        Visualizaciones {period === "week" ? "última semana" : "último mes"}:{" "}
        {viewsTotal}
      </p>

      <div style={{ width: "100%", height: 300 }} className="mb-4">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="interval" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#8884d8" />

            {lastTemporaryLabel && (
              <ReferenceLine
                x={lastTemporaryLabel}
                stroke="red"
                strokeDasharray="3 3"
                label={{ value: "Temporal", position: "top" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex space-x-2">
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

// 🔹 Componente para seleccionar videos y periodo
function VideoSelector({
  videos,
  selectedVideo,
  setSelectedVideo,
  period,
  setPeriod,
}) {
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

      {selectedVideo && <VideoStats video={selectedVideo} period={period} />}
    </div>
  )
}

export default function CtrDinamico() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [period, setPeriod] = useState("week")

  // 🔹 Traer videos desde Supabase via API
  useEffect(() => {
    if (!session) return
    let isMounted = true

    async function fetchVideos() {
      try {
        const res = await fetch(`/api/ctr-dinamico/videos?period=${period}`)
        const data = await res.json()
        if (!isMounted) return

        setVideos(data)
        if (!selectedVideo && data.length > 0) setSelectedVideo(data[0])
      } catch (err) {
        console.error("Error fetching videos:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchVideos()

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchVideos()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      isMounted = false
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [session, period])

  if (!session)
    return (
      <div className="p-8 text-black">
        <p>No estás autenticado.</p>
        <button
          className="bg-blue-300 px-4 py-2 rounded"
          onClick={() => signIn("google")}
        >
          Iniciar sesión con Google
        </button>
      </div>
    )

  if (loading) return <p className="p-4 text-black">Cargando...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-4">CTR Dinámico</h1>

      <VideoSelector
        videos={videos}
        selectedVideo={selectedVideo}
        setSelectedVideo={setSelectedVideo}
        period={period}
        setPeriod={setPeriod}
      />
    </div>
  )
}
