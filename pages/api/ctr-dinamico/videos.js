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

  console.log("🔹 Access token:", session.accessToken)
  console.log("🔹 Period:", period)

  try {
    // 1️⃣ Obtener canal del usuario
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&mine=true",
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const channelData = await channelRes.json()
    console.log("🔹 Canal:", channelData)

    if (!channelData.items || !channelData.items.length) {
      return res.status(404).json({
        error: "No se encontró canal de YouTube. Por favor vuelve a iniciar sesión y concede los permisos de YouTube correctamente.",
      })
    }

    const channelId = channelData.items[0].id
    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads

    // 2️⃣ Obtener videos de la playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const playlistData = await playlistRes.json()
    console.log("🔹 Playlist:", playlistData)

    if (!playlistData.items || !playlistData.items.length) {
      return res.status(404).json({
        error: "No se encontraron videos en tu canal de YouTube. Asegúrate de tener videos subidos y permisos activos.",
      })
    }

    const videoIds = playlistData.items.map((v) => v.contentDetails.videoId).join(",")

    // 3️⃣ Obtener estadísticas básicas de los videos (V3 Data API)
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const statsData = await statsRes.json()
    console.log("🔹 Stats:", statsData)

    // 4️⃣ Obtener Analytics de todos los videos en un solo fetch
    const analyticsRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDateStr}&endDate=${endDateStr}&metrics=views&dimensions=day,video&filters=video==${videoIds}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    const analyticsData = await analyticsRes.json()
    console.log("🔹 Analytics:", analyticsData)

    // 5️⃣ Mapear los datos de Analytics por video
    const analyticsMap = {}
    analyticsData.rows?.forEach(([day, videoId, views]) => {
      if (!analyticsMap[videoId]) analyticsMap[videoId] = []
      analyticsMap[videoId].push(parseInt(views))
    })

    // 6️⃣ Combinar datos y devolver al frontend
    const videos = statsData.items.map((v) => ({
      id: v.id,
      title: v.snippet.title,
      viewsLastWeek:
        period === "week"
          ? (analyticsMap[v.id]?.reduce((a, b) => a + b, 0) || 0)
          : undefined,
      viewsLastMonth:
        period === "month"
          ? (analyticsMap[v.id]?.reduce((a, b) => a + b, 0) || 0)
          : undefined,
      viewsByDay: analyticsMap[v.id] || Array.from({ length: period === "week" ? 7 : 30 }, () => 0),
    }))

    res.status(200).json(videos)
  } catch (err) {
    console.error("❌ Error obteniendo videos y Analytics:", err)
    res.status(500).json({
      error:
        "Error obteniendo videos y Analytics. Intenta refrescar sesión o revisa permisos de YouTube.",
      details: err.message,
    })
  }
}
