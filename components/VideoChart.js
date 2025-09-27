import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Customized,
} from "recharts"

export default function VideoChart({ title, viewsByDay }) {
  const records = viewsByDay || []
  const viewsTotal = records.length > 0 ? records[records.length - 1].views : 0

  let chartData = []
  let lastBlockPoint = null
  let nowPoint = null

  if (records.length > 0) {
    const parsedRecords = records.map(r => ({
      timestamp: new Date(r.timestamp),
      views: r.views,
    }))

    const firstDate = new Date(parsedRecords[0].timestamp)
    firstDate.setMinutes(0, 0, 0)
    firstDate.setHours(Math.floor(firstDate.getHours() / 6) * 6)

    const now = new Date()
    now.setMinutes(0, 0, 0)
    const currentBlockStart = new Date(now)
    currentBlockStart.setHours(Math.floor(now.getHours() / 6) * 6, 0, 0, 0)

    let pointer = new Date(firstDate)
    let lastViews = 0

    // Generar bloques pasados
    while (pointer <= currentBlockStart) {
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
        isRedLine: false,
      })

      pointer = blockEnd
    }

    lastBlockPoint = chartData[chartData.length - 1]

    // Punto actual para línea roja
    const nowIncrement = (records[records.length - 1].views || 0) - lastViews
    nowPoint = {
      interval: `${now.getDate()}/${now.getMonth() + 1} ${String(now.getHours()).padStart(2, "0")}:00`,
      views: nowIncrement > 0 ? nowIncrement : 0,
      isRedLine: true,
    }
    chartData.push(nowPoint)
    lastBlockPoint.isRedLine = true

    // Añadir 3 días futuros
    for (let i = 1; i <= 12; i++) {
      const future = new Date(currentBlockStart)
      future.setHours(future.getHours() + i * 6)
      chartData.push({
        interval: `${future.getDate()}/${future.getMonth() + 1} ${String(future.getHours()).padStart(2, "0")}:00`,
        views: 0,
        isRedLine: false,
      })
    }
  }

  // Dibujar recuadro en medio de línea roja
  const NowLabel = ({ points }) => {
    if (!points || points.length < 2) return null
    const redPoints = points.filter(p => chartData[p.index].isRedLine)
    if (redPoints.length < 2) return null

    const [p1, p2] = redPoints
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2

    return (
      <g>
        <rect x={midX - 30} y={midY - 15} width={60} height={20} fill="red" rx={4} ry={4} />
        <text
          x={midX}
          y={midY}
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Ahora +{nowPoint.views}
        </text>
      </g>
    )
  }

  return (
    <div style={{ width: "100%", height: 400, marginBottom: "2rem" }}>
      <h3>{title}</h3>
      <p>Visualizaciones totales: {viewsTotal}</p>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="interval" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#8884d8"
            dot={false}
          />
          {lastBlockPoint && nowPoint && (
            <Line
              type="monotone"
              dataKey="views"
              data={[lastBlockPoint, nowPoint]}
              stroke="red"
              dot={false}
              activeDot={false}
            >
              <Customized component={NowLabel} />
            </Line>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
