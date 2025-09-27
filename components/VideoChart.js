import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Customized,
} from 'recharts'

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
        interval: `${blockStart.getDate()}/${blockStart.getMonth() + 1} ${String(blockStart.getHours()).padStart(2, '0')}:00`,
        views: increment > 0 ? increment : 0,
      })

      pointer = blockEnd
    }

    lastBlockPoint = chartData[chartData.length - 1]

    const nowIncrement = (records[records.length - 1].views || 0) - lastViews
    nowPoint = {
      interval: `${now.getDate()}/${now.getMonth() + 1} ${String(now.getHours()).padStart(2, '0')}:00`,
      views: nowIncrement > 0 ? nowIncrement : 0,
    }
    chartData.push(nowPoint)
  }

  // 🔹 Customized que usa viewBox para posicionar el recuadro
  const NowLabel = (props) => {
    if (!lastBlockPoint || !nowPoint) return null
    const { viewBox } = props
    const { x, y, width, height } = viewBox

    const lastIndex = chartData.length - 2
    const nowIndex = chartData.length - 1

    // Posición X: medio entre último bloque y ahora
    const xStep = width / (chartData.length - 1)
    const xMid = xStep * lastIndex + xStep / 2

    // Posición Y proporcional al valor del incremento
    const maxViews = Math.max(...chartData.map(d => d.views))
    const yMid = height - (nowPoint.views / (maxViews || 1)) * height - 20

    return (
      <g>
        <rect x={xMid - 30} y={yMid} width={60} height={20} fill="red" rx={4} ry={4} />
        <text
          x={xMid}
          y={yMid + 14}
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
        >
          Ahora +{nowPoint.views}
        </text>
      </g>
    )
  }

  return (
    <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
      <h3>{title}</h3>
      <p>Visualizaciones totales: {viewsTotal}</p>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="interval" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#8884d8" dot={false} />
          {lastBlockPoint && nowPoint && (
            <Line
              type="monotone"
              dataKey="views"
              data={[lastBlockPoint, nowPoint]}
              stroke="red"
              dot={false}
              activeDot={false}
            />
          )}
          <Customized component={NowLabel} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
