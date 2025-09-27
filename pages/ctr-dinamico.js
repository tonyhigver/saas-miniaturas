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
  const records = video.viewsByDay || []

  // 🔹 Total real del último registro
  const viewsTotal =
    records.length > 0
      ? records[records.length - 1].views
      : 0

  let chartData = []
  let lastTemporaryLabel = null
  let lastTemporaryValue = null

  if (records.length > 0) {
    const parsedRecords = records.map((r) => ({
      timestamp: new Date(r.timestamp),
      views: r.views,
    }))

    const firstDate = new Date(parsedRecords[0].timestamp)
    firstDate.setMinutes(0, 0, 0)
    firstDate.setHours(Math.floor(firstDate.getHours() / 6) * 6)

    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(Math.floor(now.getHours() / 6) * 6)

    let pointer = new Date(firstDate)
    let lastViews = 0

    while (pointer <= now) {
      const blockStart = new Date(pointer)
      const blockEnd = new Date(pointer)
      blockEnd.setHours(blockEnd.getHours() + 6)

      const startRec = parsedRecords.filter(r => r.timestamp <= blockStart).pop()
      const startViews = startRec ? startRec.views : lastViews

      const endRec = parsedRecords.filter(r => r.timestamp <= blockEnd).pop()
      const endViews = endRec ? endRec.views : startViews

      const increment = endViews - startViews
      lastViews = endViews

      chartData.push({
        interval: `${blockStart.getDate()}/${blockStart.getMonth() + 1} ${String(blockStart.getHours()).padStart(2, "0")}:00`,
        views: increment > 0 ? increment : 0,
      })

      pointer = blockEnd
    }

    // 🔹 Línea roja temporal: último incremento desde hace 6h
    const lastRec = parsedRecords[parsedRecords.length - 1]
    const lastBlockStart = new Date(lastRec.timestamp)
    lastBlockStart.setHours(Math.floor(lastRec.timestamp.getHours() / 6) * 6, 0, 0, 0)

    const startRec = parsedRecords.filter(r => r.timestamp <= lastBlockStart).pop()
    const startViews = startRec ? startRec.views : 0

    lastTemporaryValue = lastRec.views - startViews
    lastTemporaryLabel = `${lastRec.timestamp.getDate()}/${lastRec.timestamp.getMonth() + 1} ${String(lastRec.timestamp.getHours()).padStart(2, "0")}:00`
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-200 text-black mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>
        Visualizaciones {period === "week" ? "última semana" : "último mes"}: {viewsTotal}
      </p>

      <div style={{ width: "100%", height: 300 }} className="mb-4">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="interval" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#8884d8" />

            {lastTemporaryLabel && (
              <ReferenceLine
                x={lastTemporaryLabel}
                stroke="red"
                strokeDasharray="3 3"
                label={{
                  value: `+${lastTemporaryValue}`,
                  position: "top",
                  fill: "red",
                }}
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
        onChange={(e) => setSelectedVideo(videos.find(v => v.id === e.target.value))}
      >
        <option value="">Selecciona un video</option>
        {videos.map((video) => (
          <option key={video.id} value={video.id}>{video.title}</option>
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
