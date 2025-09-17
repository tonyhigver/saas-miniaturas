// pages/create-video.js
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"

export default function CreateVideo() {
  const { data: session } = useSession()
  const router = useRouter()
  const [videoFile, setVideoFile] = useState(null)

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!videoFile) {
      alert("Por favor selecciona un archivo de video antes de procesar.")
      return
    }

    console.log("Archivo de video listo para enviar:", videoFile)
    // Aquí iría fetch/axios al backend para procesar el video
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p>No has iniciado sesión.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subir y procesar Video</h1>
        <div className="flex items-center gap-4">
          <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full" />
          <button
            onClick={() => signOut()}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Cerrar sesión
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Salir
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center">
        {/* Recuadro de subida */}
        <label
          htmlFor="videoFile"
          className="w-full max-w-lg h-40 border-2 border-dashed border-gray-500 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 rounded-lg"
        >
          <span className="mb-2">Haz clic o arrastra un video aquí</span>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {videoFile && (
            <p className="text-green-400 mt-2">
              Archivo seleccionado: {videoFile.name}
            </p>
          )}
        </label>

        {/* Botón procesar */}
        <button
          type="submit"
          className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Procesar
        </button>
      </form>
    </div>
  )
}
