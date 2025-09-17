// pages/create-form.js
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

export default function CreateForm() {
  const { data: session } = useSession()

  // Estado para todos los valores
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    videoFile: null,
    videoPlot: "",
    titleText: "",
    titleColor: "#FFFFFF",
    mainColors: "",
    referenceImages: [],
    emojis: "",
    format: "16:9",
    clickbaitLevel: 50,
    numFaces: 1,
    visualElements: "",
    additionalText: "",
    numResults: 3,
    polarize: false,
    template: "",
  })

  // Estado para activar/desactivar cada campo
  const [enabledFields, setEnabledFields] = useState({
    description: false,
    category: false,
    videoFile: false,
    videoPlot: false,
    titleText: false,
    titleColor: false,
    mainColors: false,
    referenceImages: false,
    emojis: false,
    format: false,
    clickbaitLevel: false,
    numFaces: false,
    visualElements: false,
    additionalText: false,
    numResults: false,
    polarize: false,
    template: false,
  })

  // Control de cambios
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files }))
    } else if (type === "checkbox" && name in enabledFields) {
      setEnabledFields((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Filtrar solo los campos activos
    const activeData = {}
    for (const key in formData) {
      if (enabledFields[key]) {
        activeData[key] = formData[key]
      }
    }

    console.log("Datos enviados al backend:", activeData)
    // Aquí iría fetch/axios para mandar los datos a tu backend
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
        <h1 className="text-3xl font-bold">Crear Miniatura con Formulario</h1>
        <div className="flex items-center gap-4">
          <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full" />
          <button
            onClick={() => signOut()}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Formulario completo */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 1️⃣ Extraer info */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">1️⃣ Extraer información</h2>

          <label className="flex gap-2 items-center">
            <input type="checkbox" name="description" checked={enabledFields.description} onChange={handleChange} />
            Prompt / Descripción de la miniatura
          </label>
          {enabledFields.description && (
            <input
              type="text"
              name="description"
              placeholder="Ejemplo: Miniatura de un gameplay épico..."
              className="p-2 w-full rounded bg-gray-800"
              value={formData.description}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input type="checkbox" name="category" checked={enabledFields.category} onChange={handleChange} />
            Categoría
          </label>
          {enabledFields.category && (
            <select name="category" value={formData.category} onChange={handleChange} className="p-2 rounded bg-gray-800">
              <option value="">Selecciona</option>
              <option value="Gaming">Gaming</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Vlog">Vlog</option>
              <option value="Educación">Educación</option>
            </select>
          )}

          <label className="flex gap-2 items-center mt-3">
            <input type="checkbox" name="videoFile" checked={enabledFields.videoFile} onChange={handleChange} />
            Subir video para analizar plot
          </label>
          {enabledFields.videoFile && <input type="file" name="videoFile" accept="video/*" onChange={handleChange} />}

          <label className="flex gap-2 items-center mt-3">
            <input type="checkbox" name="videoPlot" checked={enabledFields.videoPlot} onChange={handleChange} />
            Escribir plot del video
          </label>
          {enabledFields.videoPlot && (
            <textarea
              name="videoPlot"
              placeholder="Resumen completo del video..."
              className="p-2 w-full rounded bg-gray-800"
              value={formData.videoPlot}
              onChange={handleChange}
            />
          )}
        </div>

        {/* 2️⃣ Partes visuales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">2️⃣ Partes visuales</h2>

          {/* Aquí se mantienen todos los campos que tenías... */}
          {/* ...titleText, titleColor, mainColors, referenceImages, emojis, format, clickbaitLevel, numFaces, visualElements, additionalText */}
        </div>

        {/* 3️⃣ Puntos adicionales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Puntos adicionales</h2>

          {/* Aquí se mantienen numResults, polarize y template */}
        </div>

        <button
          type="submit"
          className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition mt-4"
        >
          Procesar
        </button>
      </form>
    </div>
  )
}
