// pages/saas-main.js
import { useSession, signOut } from "next-auth/react"
import Sidebar from "../components/Sidebar" // <- Importación relativa
import Link from "next/link" // 👈 Importamos Link para navegar a otras páginas

export default function SaaSMain() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl">No has iniciado sesión.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Barra lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 p-8 ml-12">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard del SaaS</h1>
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

        <main className="space-y-6">
          <p className="text-lg">
            Bienvenido, {session.user.name}! Aquí irá tu SaaS de miniaturas y optimización CTR.
          </p>

          {/* Enlace al módulo CTR Dinámico */}
          <div className="mt-6">
            <Link
              href="/ctr-dinamico"
              className="inline-block bg-blue-500 px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-600 transition"
            >
              🚀 Ir a CTR Dinámico
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
