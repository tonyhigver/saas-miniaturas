"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
// 🔹 Cambiado a ruta relativa
import { supabase } from "../lib/supabaseClient"

export default function ViewsChart({ userId, videoId }) {
  const svgRef = useRef()
  const [data, setData] = useState([])

  // 🔹 Traer datos de Supabase
  useEffect(() => {
    if (!videoId) return

    async function fetchData() {
      const { data: rows, error } = await supabase
        .from("video_metrics")
        .select("views, timestamp")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .order("timestamp", { ascending: true })

      if (error) {
        console.error("❌ Error cargando métricas:", error)
        return
      }

      const parsed = rows.map(r => ({
        views: r.views,
        ts: new Date(r.timestamp),
      }))

      // 🔹 Agrupar por bloques de 6 horas
      const sixHours = 1000 * 60 * 60 * 6
      const grouped = d3.groups(parsed, d =>
        Math.floor(d.ts.getTime() / sixHours)
      )

      const diffs = grouped.map(([block, values]) => {
        const sorted = values.sort((a, b) => a.ts - b.ts)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        return {
          time: new Date(block * sixHours),
          viewsDiff: last.views - first.views,
        }
      })

      setData(diffs)
    }

    fetchData()
  }, [userId, videoId])

  // 🔹 Dibujar gráfico D3
  useEffect(() => {
    if (data.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = 800
    const height = 400
    const margin = { top: 20, right: 30, bottom: 50, left: 60 }

    svg.selectAll("*").remove()
    svg.attr("viewBox", [0, 0, width, height])

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.viewsDiff)])
      .nice()
      .range([height - margin.bottom, margin.top])

    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(d3.timeHour.every(6))
        .tickFormat(d3.timeFormat("%d %Hh"))
      )

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    // Línea
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.viewsDiff))

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Puntos
    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.viewsDiff))
      .attr("r", 4)
      .attr("fill", "steelblue")
  }, [data])

  return <svg ref={svgRef} className="w-full h-[400px]" />
}
