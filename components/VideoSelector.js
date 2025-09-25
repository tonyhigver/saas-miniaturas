// components/VideoSelector.js
import { useEffect, useState } from "react"
import VideoStats from "./VideoStats"

export default function VideoSelector({ accessToken }) {
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
