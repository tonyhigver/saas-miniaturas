// pages/api/ctr-dinamico/videos.js
import { getSession } from "next-auth/react"
import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: "No autenticado" })

  const { period } = req.query // "week" o "month"
  const today = new Date()
  const startDate = new Date(today)
  if (period === "week") startDate.setDate(today.getDate() - 6)
  else startDate.setDate(today.getDate() - 29)

  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = today.toISOString().split("T")[0]

  try {
    // 🔹 1️⃣ Obtener videos recientes de YouTube
    const accessToken = session.accessToken
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&mine=true",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const channelData = await channelRes.json()
    if (!channelData.items || !channelData.items.length) {
      return res.status(404).json({
        error: "No se encontró canal de YouTube. Vuelve a iniciar sesión y concede permisos."
      })
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const playlistData = await playlistRes.json()
    if (!playlistData.items || !playlistData.items.length) {
      return res.status(404).json({
        error: "No se encontraron videos en tu canal."
      })
    }

    // Filtrar videos subidos en el periodo
    const videosInPeriod = playlistData.items.filter(v => {
      const uploadDate = new Date(v.contentDetails.videoPublishedAt)
      return uploadDate >= startDate && uploadDate <= today
    })

    const videoIds = videosInPeriod.map(v => v.contentDetails.videoId).join(",")
    if (!videoIds) {
      return res.status(200).json([]) // No hay videos en el periodo
    }

    // 🔹 2️⃣ Obtener estadísticas de YouTube
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const statsData = await statsRes.json()

    // 🔹 3️⃣ Obtener métricas históricas desde Supabase
    const { data: metrics, error } = await supabase
      .from("video_metrics")
      .select("*")
      .eq("user_id", session.user.id)
      .in("video_id", videosInPeriod.map(v => v.contentDetails.videoId))
      .order("timestamp", { ascending: true })

    if (error) console.error("Error leyendo métricas Supabase:", error)

    // 🔹 4️⃣ Mapear métricas por video
    const analyticsMap = {}
    metrics?.forEach(m => {
      if (!analyticsMap[m.video_id]) analyticsMap[m.video_id] = []
      analyticsMap[m.video_id].push({
        timestamp: m.timestamp,
        views: m.views,
        likes: m.likes,
        comments: m.comments
      })
    })

    // 🔹 5️⃣ Combinar datos y devolver
    const videos = statsData.items.map(v => ({
      id: v.id,
      title: v.snippet.title,
      viewsLastWeek: period === "week"
        ? (analyticsMap[v.id]?.slice(-7).reduce((a, b) => a + b.views, 0) || 0)
        : undefined,
      viewsLastMonth: period === "month"
        ? (analyticsMap[v.id]?.slice(-30).reduce((a, b) => a + b.views, 0) || 0)
        : undefined,
      viewsByDay: analyticsMap[v.id]?.map(d => d.views) || Array.from({ length: period === "week" ? 7 : 30 }, () => 0)
    }))

    res.status(200).json(videos)
  } catch (err) {
    console.error("❌ Error obteniendo videos y métricas:", err)
    res.status(500).json({
      error: "Error obteniendo videos y métricas",
      details: err.message
    })
  }
}
