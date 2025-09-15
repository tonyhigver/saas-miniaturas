// pages/create-miniature.js
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"

export default function CreateMiniature() {
  const { data: session } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    description: "",
    category: "",
    videoFile: null,
    videoPlot: "",
    titleText: "",
    titleFont: "Arial",
    titleColor: "#FFFFFF",
    mainColors: ["#000000"],
    referenceImages: [],
    emojis: [],
    format: "16:9",
    clickbaitLevel: 50,
    numFaces: 1,
    visualElements: [],
    additionalText: "",
    numResults: 3,
    polarize: false,
    template: "",
  })

  const [sectionsEnabled, setSectionsEnabled] = useState({
    extractInfo: true,
    visualParts: true,
    extraPoints: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === "checkbox") {
      setSectionsEnabled((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí llamarías a tu backend con fetch o axios
    console.log("Enviando datos al backend:", formData)
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
        <h1 className="text-3xl font-bold">Creador de Miniaturas</h1>
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* 1️⃣ Extraer info de la miniatura */}
        <div className="border p-4 rounded-lg">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="extractInfo" checked={sectionsEnabled.extractInfo} onChange={handleChange} />
            <span className="font-semibold">Extraer información de la miniatura</span>
          </label>
          {sectionsEnabled.extractInfo && (
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="text"
                name="description"
                placeholder="Descripción / Prompt"
                className="p-2 rounded bg-gray-800"
                value={formData.description}
                onChange={handleChange}
              />
              <select name="category" value={formData.category} onChange={handleChange} className="p-2 rounded bg-gray-800">
                <option value="">Selecciona categoría</option>
                <option value="Gaming">Gaming</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Vlog">Vlog</option>
                <option value="Educación">Educación</option>
              </select>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleChange}
              />
              <textarea
                name="videoPlot"
                placeholder="Resumen / Plot del video"
                className="p-2 rounded bg-gray-800"
                value={formData.videoPlot}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* 2️⃣ Partes visuales */}
        <div className="border p-4 rounded-lg">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="visualParts" checked={sectionsEnabled.visualParts} onChange={handleChange} />
            <span className="font-semibold">Partes visuales</span>
          </label>
          {sectionsEnabled.visualParts && (
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="text"
                name="titleText"
                placeholder="Texto principal"
                className="p-2 rounded bg-gray-800"
                value={formData.titleText}
                onChange={handleChange}
              />
              <input
                type="color"
                name="titleColor"
                value={formData.titleColor}
                onChange={handleChange}
              />
              <input
                type="text"
                name="mainColors"
                placeholder="Colores principales separados por coma"
                className="p-2 rounded bg-gray-800"
                value={formData.mainColors}
                onChange={handleChange}
              />
              <input
                type="file"
                name="referenceImages"
                multiple
                accept="image/*"
                onChange={handleChange}
              />
              <input
                type="text"
                name="emojis"
                placeholder="Emojis o stickers separados por coma"
                className="p-2 rounded bg-gray-800"
                value={formData.emojis}
                onChange={handleChange}
              />
              <select name="format" value={formData.format} onChange={handleChange} className="p-2 rounded bg-gray-800">
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
                <option value="9:16">9:16</option>
              </select>
              <input
                type="range"
                min="0"
                max="100"
                name="clickbaitLevel"
                value={formData.clickbaitLevel}
                onChange={handleChange}
              />
              <input
                type="number"
                name="numFaces"
                min="0"
                max="5"
                placeholder="Número de caras"
                className="p-2 rounded bg-gray-800"
                value={formData.numFaces}
                onChange={handleChange}
              />
              <input
                type="text"
                name="visualElements"
                placeholder="Elementos visuales separados por coma"
                className="p-2 rounded bg-gray-800"
                value={formData.visualElements}
                onChange={handleChange}
              />
              <textarea
                name="additionalText"
                placeholder="Texto adicional"
                className="p-2 rounded bg-gray-800"
                value={formData.additionalText}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* 3️⃣ Puntos aparte */}
        <div className="border p-4 rounded-lg">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="extraPoints" checked={sectionsEnabled.extraPoints} onChange={handleChange} />
            <span className="font-semibold">Puntos adicionales</span>
          </label>
          {sectionsEnabled.extraPoints && (
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="number"
                name="numResults"
                min="1"
                max="20"
                placeholder="Cantidad de miniaturas a generar"
                className="p-2 rounded bg-gray-800"
                value={formData.numResults}
                onChange={handleChange}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="polarize"
                  checked={formData.polarize}
                  onChange={handleChange}
                />
                Polarizar resultados (variantes distintas)
              </label>
              <input
                type="text"
                name="template"
                placeholder="Plantilla base para la miniatura"
                className="p-2 rounded bg-gray-800"
                value={formData.template}
                onChange={handleChange}
              />
            </div>
          )}
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
