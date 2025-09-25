// pages/ctr-dinamico.js
import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"

export default function CtrDinamico() {
  const { data: session } = useSession()
  const [isActivated, setIsActivated] = useState(false)
  const [intervalHours, setIntervalHours] = useState(24)
  const [intervalMinutes, setIntervalMinutes] = useState(0)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔹 Simulación: al montar, traer estado desde backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/ctr-dinamico/status")
        const data = await res.json()
        setIsActivated(data.isActivated)
        setVideos(data.videos || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (session) {
      fetchData()
    }
  }, [session])

  // 🔹 Handler: activar por primera vez (tras consentimiento Google)
  async function handleActivate() {
    if (!session) {
      // Abre consentimiento de Google
      signIn("google")
      return
    }

    // Si ya está logueado, llamamos a backend para activar
    const res = await fetch("/api/ctr-dinamico/activate", {
      method: "POST",
    })
    if (res.ok) {
      setIsActivated(true)
    }
  }

  // 🔹 Handler: guardar cambios de intervalo
  async function handleSaveSettings() {
    const body = {
      intervalHours,
      intervalMinutes,
    }
    await fetch("/api/ctr-dinamico/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    alert("Configuración guardada ✅")
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CTR Dinámico</h1>

      {/* 🔹 Aviso de error con token */}
      {session?.error && (
        <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>⚠️ Error con el token de Google. Por favor, vuelve a iniciar sesión.</span>
          <button
            onClick={() => signIn("google")}
            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isActivated ? (
        <div className="border rounded-xl p-6 shadow">
          <p className="mb-4">
            Aún no has activado el sistema de CTR Dinámico para tus videos.
          </p>
          <button
            onClick={handleActivate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
          >
            Empezar 🚀
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Configuración */}
          <div className="border rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Configuración</h2>
            <label className="block mb-2">
              Intervalo de revisión:
              <div className="flex space-x-2 mt-2">
                <input
                  type="number"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="w-20 border rounded p-1"
                />
                <span>horas</span>
                <input
                  type="number"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="w-20 border rounded p-1"
                />
                <span>minutos</span>
              </div>
            </label>
            <button
              onClick={handleSaveSettings}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700"
            >
              Guardar cambios
            </button>
          </div>

          {/* Lista de videos */}
          <div className="border rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Tus Videos</h2>
            {videos.length === 0 ? (
              <p>No hay videos conectados todavía.</p>
            ) : (
              <ul className="space-y-3">
                {videos.map((video) => (
                  <li
                    key={video.id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <span>{video.title}</span>
                    <span className="text-sm text-gray-500">
                      CTR: {video.ctr}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
