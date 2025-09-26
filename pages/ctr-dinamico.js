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

  // Ordenar registros por timestamp
  const sorted = [...(video.viewsByInterval || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )

  const groupedData = []
  let lastBlockValue = 0
  let lastBlockTime = null

  sorted.forEach((entry) => {
    const date = new Date(entry.timestamp)
    const blockStartHour = Math.floor(date.getHours() / 6) * 6
    const blockStart = new Date(date)
    blockStart.setHours(blockStartHour, 0, 0, 0)
    const label = `${date.getDate()}/${date.getMonth() + 1} ${blockStartHour}:00`

    // Si es un nuevo bloque
    if (!lastBlockTime || blockStart > lastBlockTime) {
      groupedData.push({
        interval: label,
        views: entry.views - lastBlockValue,
        isTemp: false,
      })
      lastBlockValue = entry.views
      lastBlockTime = blockStart
    } else {
      // Registro dentro de bloque incompleto → línea temporal
      groupedData.push({
        interval: `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}`,
        views: entry.views - lastBlockValue,
        isTemp: true,
      })
    }
  })

  return (
    <div className="p-4 border rounded-lg bg-gray-200 text-black mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>
        Visualizaciones {period === "week" ? "última semana" : "último mes"}: {viewsTotal}
      </p>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart
            data={groupedData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="interval" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#8884d8"
              dot={false}
              isAnimationActive={false}
            />
            {/* Dibujar líneas verticales temporales */}
            {groupedData
              .filter((d) => d.isTemp)
              .map((d, i) => (
                <ReferenceLine
                  key={i}
                  x={d.interval}
                  stroke="red"
                  label={{ value: d.views, position: "top", fill: "red" }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 🔹 Componente para seleccionar videos y periodo
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
