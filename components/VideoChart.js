import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function VideoChart({ title, viewsByDay }) {
  // Crear datos para el gráfico
  const data = viewsByDay.map((views, i) => ({
    day: i + 1,
    views
  }))

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3>{title}</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="day" label={{ value: 'Día', position: 'insideBottomRight', offset: 0 }} />
          <YAxis label={{ value: 'Vistas', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
