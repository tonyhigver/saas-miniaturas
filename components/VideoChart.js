import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function VideoChart({ title, viewsByDay }) {
  const records = viewsByDay || []

  // 🔹 Total real del último registro
  const viewsTotal = records.length > 0 ? records[records.length - 1].views : 0

  let chartData = []
  let lastTemporaryLabel = null
  let lastTemporaryValue = 0

  if (records.length > 0) {
    // 🔹 Parsear timestamps
    const parsedRecords = records.map(r => ({
      timestamp: new Date(r.timestamp),
      views: r.views,
    }))

    const firstDate = new Date(parsedRecords[0].timestamp)
    firstDate.setMinutes(0, 0, 0)
    firstDate.setHours(Math.floor(firstDate.getHours() / 6) * 6)

    const now = new Date()
    now.setMinutes(0, 0, 0)
    const lastHourBlock = Math.floor(now.getHours() / 6) * 6
    now.setHours(lastHourBlock)

    let pointer = new Date(firstDate)
    let lastViews = 0

    while (pointer <= now) {
      const blockStart = new Date(pointer)
      const blockEnd = new Date(pointer)
      blockEnd.setHours(blockEnd.getHours() + 6)

      // Último registro antes o igual al inicio del bloque
      const startRec = parsedRecords.filter(r => r.timestamp <= blockStart).pop()
      const startViews = startRec ? startRec.views : lastViews

      // Último registro antes o igual al final del bloque
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

    // 🔹 Línea roja para mostrar incremento desde el último bloque hasta ahora
    const lastRec = parsedRecords[parsedRecords.length - 1]
    const lastBlockStartHour = Math.floor(lastRec.timestamp.getHours() / 6) * 6
    const lastBlockStart = new Date(lastRec.timestamp)
    lastBlockStart.setHours(lastBlockStartHour, 0, 0, 0)

    const startRec = parsedRecords.filter(r => r.timestamp <= lastBlockStart).pop()
    const startViews = startRec ? startRec.views : 0
    lastTemporaryValue = lastRec.views - startViews

    const nextHour = lastBlockStartHour + 6
    lastTemporaryLabel = `${lastRec.timestamp.getDate()}/${lastRec.timestamp.getMonth() + 1} ${String(nextHour).padStart(2, '0')}:00`
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
          <Line type="monotone" dataKey="views" stroke="#8884d8" />

          {lastTemporaryLabel && (
            <ReferenceLine
              x={lastTemporaryLabel}
              stroke="red"
              strokeDasharray="3 3"
              label={{
                value: `+${lastTemporaryValue}`,
                position: 'top',
                fill: 'red',
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
