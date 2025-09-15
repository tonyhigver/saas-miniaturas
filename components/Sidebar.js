// components/Sidebar.js
import { useRouter } from "next/router"

export default function Sidebar() {
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 h-full bg-gray-900 text-white w-16 hover:w-64 transition-all duration-300 shadow-lg flex flex-col overflow-hidden group">
      <div className="flex flex-col mt-10">
        <button
          onClick={() => router.push("/create-miniature")}
          className="flex items-center gap-2 p-4 hover:bg-gray-700"
        >
          <span className="material-icons">image</span>
          {/* Texto aparece al hacer hover en la barra */}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Miniaturas
          </span>
        </button>

        <button
          onClick={() => router.push("/ctr-prediction")}
          className="flex items-center gap-2 p-4 hover:bg-gray-700"
        >
          <span className="material-icons">show_chart</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            CTR
          </span>
        </button>

        <button
          onClick={() => router.push("/ab-test")}
          className="flex items-center gap-2 p-4 hover:bg-gray-700"
        >
          <span className="material-icons">compare_arrows</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            A/B Test
          </span>
        </button>
      </div>
    </div>
  )
}
