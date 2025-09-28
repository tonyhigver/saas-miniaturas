// pages/ctr-dinamico.js
"use client"

import { useEffect, useState, useRef } from "react"
import { useSession, signIn } from "next-auth/react"
import * as d3 from "d3"

// 🔹 Componente para mostrar estadísticas y gráfico interactivo
function VideoStats({ video, period }) {
  const records = video.viewsByDay || []
  const svgRef = useRef()

  // 🔹 Total real del último registro
  const viewsTotal =
    records.length > 0
      ? records[records.length - 1].views
      : 0

  let chartData = []
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
        time: new Date(blockStart),
        views: increment > 0 ? increment : 0,
      })

      pointer = blockEnd
    }
  }

  // 🔹 Renderizar gráfico con D3
  useEffect(() => {
    if (chartData.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = 600
    const height = 300
    const margin = { top: 20, right: 30, bottom: 50, left: 50 }

    svg.selectAll("*").remove()
    svg.attr("viewBox", [0, 0, width, height])

    const x = d3
      .scaleTime()
      .domain(d3.extent(chartData, d => d.time))
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, d => d.views)])
      .nice()
      .range([height - margin.bottom, margin.top])

    // Ejes
    const xAxis = d3.axisBottom(x).ticks(d3.timeHour.every(6)).tickFormat(d3.timeFormat("%d %Hh"))
    const yAxis = d3.axisLeft(y)

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)

    // Línea
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.views))

    svg.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Puntos
    svg.selectAll("circle")
      .data(chartData)
      .join("circle")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.views))
      .attr("r", 3)
      .attr("fill", "steelblue")
  }, [chartData])

  return (
    <div className="p-4 border rounded-lg bg-gray-200 text-black mt-4">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>
        Visualizaciones {period === "week" ? "última semana" : "último mes"}: {viewsTotal}
      </p>
      <svg ref={svgRef} className="w-full h-[300px]" />
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
