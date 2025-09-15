// pages/index.js
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/router"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleStart = () => {
    router.push("/saas-main")
  }

  // Mostrar loading mientras NextAuth verifica sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Cargando...
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#03245C] p-4">
      {session && session.user && (
        <img
          src={session.user.image}
          alt={session.user.name}
          className="absolute top-4 right-4 w-10 h-10 rounded-full shadow-md"
          title={session.user.name}
        />
      )}

      <h1 className="text-6xl font-extrabold text-center mb-6 text-white drop-shadow-[0_0_20px_rgb(255,255,255)]">
        Hola SaaS 🚀
      </h1>
      <p className="text-center text-lg mb-8 max-w-lg text-gray-200">
        Transcribe, indexa y busca automáticamente en tus videos subidos.
      </p>

      {!session ? (
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-white text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition mb-4 flex items-center gap-2 shadow-md"
        >
          Iniciar sesión con Google
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p className="text-white text-xl font-semibold">
            Hola, {session.user.name}!
          </p>
          <button
            onClick={handleStart}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition shadow-md"
          >
            EMPEZAR
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition mt-2"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <footer className="mt-16 text-gray-400 text-sm">
        <a href="/terms" className="underline mx-2">
          Términos
        </a>
        <a href="/privacy" className="underline mx-2">
          Privacidad
        </a>
      </footer>
    </div>
  )
}
