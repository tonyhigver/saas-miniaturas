// pages/api/ctr-dinamico/videos.js
import { getSession } from "next-auth/react"

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
    // 1️⃣ Obtener el canal del usuario
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const channelData = await channelRes.json()
    if (!channelData.items || !channelData.items.length)
      return res.status(404).json({ error: "No se encontró canal de YouTube" })

    const channelId = channelData.items[0].id

    // 2️⃣ Obtener playlist de uploads
    const uploadsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const uploadsData = await uploadsRes.json()
    const uploadsPlaylistId =
      uploadsData.items[0].contentDetails.relatedPlaylists.uploads

    // 3️⃣ Obtener videos de la playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const playlistData = await playlistRes.json()
    const videoIds = playlistData.items.map((v) => v.contentDetails.videoId)

    // 4️⃣ Obtener estadísticas y analytics de los videos
    const videos = []
    for (const videoId of videoIds) {
      // 🔹 Analytics API para views por día
      const analyticsRes = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDateStr}&endDate=${endDateStr}&metrics=views&dimensions=day&filters=video==${videoId}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      )
      const analyticsData = await analyticsRes.json()

      const viewsByDay =
        analyticsData.rows?.map((row) => parseInt(row[1])) ||
        Array.from({ length: period === "week" ? 7 : 30 }, () => 0)

      // 🔹 Estadísticas básicas del video
      const videoStatsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      )
      const videoStatsData = await videoStatsRes.json()
      const v = videoStatsData.items[0]

      videos.push({
        id: v.id,
        title: v.snippet.title,
        viewsLastWeek:
          period === "week" ? viewsByDay.reduce((a, b) => a + b, 0) : undefined,
        viewsLastMonth:
          period === "month" ? viewsByDay.reduce((a, b) => a + b, 0) : undefined,
        viewsByDay,
      })
    }

    res.status(200).json(videos)
  } catch (err) {
    console.error("❌ Error obteniendo videos y Analytics:", err)
    res.status(500).json({ error: "Error obteniendo videos y Analytics" })
  }
}
