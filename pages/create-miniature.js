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
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Creador de Miniaturas</h1>
      <p>Página donde podrás subir o generar miniaturas para tus videos.</p>
    </div>
  )
}
