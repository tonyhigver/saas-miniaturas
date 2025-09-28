"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { supabase } from "../lib/supabaseClient"

export default function ViewsChart({ userId, videoId }) {
  const svgRef = useRef()
  const [data, setData] = useState([])

  // 🔹 Traer datos de Supabase y generar bloques de 6h
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

      const parsed = rows.map(r => ({ views: r.views, ts: new Date(r.timestamp) }))

      const sixHours = 1000 * 60 * 60 * 6
      const now = new Date()
      now.setMinutes(0, 0, 0)
      now.setHours(Math.floor(now.getHours() / 6) * 6)

      const lastDate = new Date(now)
      lastDate.setDate(lastDate.getDate() + 3) // 3 días futuros

      let pointer = parsed.length > 0
        ? new Date(parsed[0].ts)
        : new Date(now)
      pointer.setMinutes(0, 0, 0)
      pointer.setHours(Math.floor(pointer.getHours() / 6) * 6)

      let lastViews = 0
      let chartData = []

      while (pointer <= lastDate) {
        const blockStart = new Date(pointer)
        const blockEnd = new Date(pointer)
        blockEnd.setHours(blockEnd.getHours() + 6)

        const startRec = parsed.filter(r => r.ts <= blockStart).pop()
        const startViews = startRec ? startRec.views : lastViews

        const endRec = parsed.filter(r => r.ts <= blockEnd).pop()
        const endViews = endRec ? endRec.views : startViews

        const increment = endViews - startViews
        lastViews = endViews

        chartData.push({
          time: new Date(blockStart),
          viewsDiff: increment > 0 ? increment : 0,
        })

        pointer = blockEnd
      }

      setData(chartData)
    }

    fetchData()
  }, [userId, videoId])

  // 🔹 Dibujar gráfico
  useEffect(() => {
    if (data.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = 700
    const height = 350
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }

    svg.selectAll("*").remove()
    svg.attr("viewBox", [0, 0, width, height])

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.viewsDiff)])
      .nice()
      .range([height - margin.bottom, margin.top])

    // 🔹 Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .ticks(d3.timeHour.every(6))
        .tickFormat(d3.timeFormat("%d %Hh")))
      .selectAll("text")
      .attr("fill", "#00ffff")
      .style("font-weight", "bold")

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("fill", "#00ffff")
      .style("font-weight", "bold")

    // 🔹 Línea y puntos
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.viewsDiff))

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00ffff")
      .attr("stroke-width", 2)
      .attr("d", line)

    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.viewsDiff))
      .attr("r", 4)
      .attr("fill", "#00ffff")
  }, [data])

  return <svg ref={svgRef} className="w-full h-[350px] border border-[#00ffff] rounded-lg" />
}
