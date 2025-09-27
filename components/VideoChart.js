import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from 'recharts'

export default function VideoChart({ title, viewsByDay }) {
  const records = viewsByDay || []

  const viewsTotal = records.length > 0 ? records[records.length - 1].views : 0

  let chartData = []

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

    // 🔹 Agregar punto "ahora" con incremento respecto al bloque anterior
    const lastBlock = parsedRecords.filter(r => r.timestamp <= currentBlockStart).pop()
    const lastBlockViews = lastBlock ? lastBlock.views : 0
    const nowIncrement = (records[records.length - 1].views || 0) - lastBlockViews

    chartData.push({
      interval: `${now.getDate()}/${now.getMonth() + 1} ${String(now.getHours()).padStart(2, '0')}:00`,
      views: nowIncrement > 0 ? nowIncrement : 0,
      isNow: true, // marcar este punto para mostrar etiqueta roja
    })
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

          {/* Línea roja "ahora" */}
          <Line
            type="monotone"
            dataKey="views"
            stroke="red"
            dot={false}
            activeDot={false}
            legendType="none"
            data={chartData.filter(d => d.isNow)}
          >
            {chartData.map((entry, index) =>
              entry.isNow ? (
                <Label
                  key={index}
                  value={`${entry.interval} +${entry.views}`}
                  position="top"
                  fill="red"
                  fontSize={12}
                  fontWeight="bold"
                  dy={-10}
                />
              ) : null
            )}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
