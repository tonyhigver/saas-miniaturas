// components/VideoStats.js
export default function VideoStats({ video }) {
  // Ejemplo de estadística simulada
  const views = video.viewsLastWeek || 0

  return (
    <div className="p-4 border rounded-lg bg-gray-800">
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <p>Visualizaciones últimas 7 días: {views}</p>

      <div className="mt-4 space-y-2">
        <button
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          onClick={() => alert("Aquí llamarías a tu backend para cambiar miniatura")}
        >
          Cambiar miniatura
        </button>
        <button
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
          onClick={() => alert("Aquí llamarías a tu backend para cambiar título")}
        >
          Cambiar título
        </button>
      </div>
    </div>
  )
}
