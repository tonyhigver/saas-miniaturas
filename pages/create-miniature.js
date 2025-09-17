// pages/create-miniature.js
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"

export default function CreateMiniature() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p>No has iniciado sesión.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col">
      <header className="flex justify-between items-center mb-20">
        <h1 className="text-3xl font-bold">Creador de Miniaturas</h1>
        <div className="flex items-center gap-4">
          <img
            src={session.user.image}
            alt={session.user.name}
            className="w-10 h-10 rounded-full"
          />
          <button
            onClick={() => signOut()}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Selector de opciones */}
      <div className="flex flex-col items-center justify-center gap-10 mt-10">
        <button
          onClick={() => router.push("/create-form")}
          className="bg-blue-600 w-80 py-10 text-2xl font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Crear con Formulario
        </button>

        <button
          onClick={() => router.push("/create-video")}
          className="bg-purple-600 w-80 py-10 text-2xl font-bold rounded-lg hover:bg-purple-700 transition"
        >
          Crear con Video
        </button>
      </div>
    </div>
  )
}
