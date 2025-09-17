// pages/create-miniature.js
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

export default function CreateMiniature() {
  const { data: session } = useSession()

  // Estado para todos los valores del formulario
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    videoFile: null,           // File
    videoPlot: "",
    titleText: "",
    titleColor: "#FFFFFF",
    mainColors: "",
    referenceImages: [],       // Array<File>
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

  // Estado para activar/desactivar cada campo -> usamos "enable_<campo>"
  const [enabledFields, setEnabledFields] = useState({
    enable_description: false,
    enable_category: false,
    enable_videoFile: false,
    enable_videoPlot: false,
    enable_titleText: false,
    enable_titleColor: false,
    enable_mainColors: false,
    enable_referenceImages: false,
    enable_emojis: false,
    enable_format: false,
    enable_clickbaitLevel: false,
    enable_numFaces: false,
    enable_visualElements: false,
    enable_additionalText: false,
    enable_numResults: false,
    enable_polarize: false,
    enable_template: false,
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Handler genérico para inputs
  const handleChange = (e) => {
    const { name, value, type, checked, files, multiple } = e.target

    // Si es checkbox de habilitar/deshabilitar (empieza por "enable_")
    if (type === "checkbox" && name.startsWith("enable_")) {
      setEnabledFields((prev) => ({ ...prev, [name]: checked }))
      return
    }

    // Si es un input file
    if (type === "file") {
      const isMultiple = e.target.multiple
      const valueToSet = isMultiple ? Array.from(files) : files[0] || null
      setFormData((prev) => ({ ...prev, [name]: valueToSet }))
      return
    }

    // Si es checkbox normal (valor booleano del campo)
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    // Resto (text, select, number, color, textarea)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Envío: construir FormData sólo con campos activados
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = new FormData()

      for (const key of Object.keys(formData)) {
        const enableKey = `enable_${key}`
        if (!enabledFields[enableKey]) continue // sólo campos habilitados

        const value = formData[key]
        if (value === undefined || value === null) continue

        // Si es File único
        if (value instanceof File) {
          data.append(key, value)
          continue
        }

        // Si es array de Files (p. ej. referenceImages)
        if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
          // append multiple files with same field name
          value.forEach((file) => data.append(key, file))
          continue
        }

        // Si es array de valores no-file -> serializar
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value))
          continue
        }

        // Si es objeto -> serializar JSON
        if (typeof value === "object") {
          data.append(key, JSON.stringify(value))
          continue
        }

        // boolean / number / string -> siempre como string
        data.append(key, String(value))
      }

      // Opcional: añadir info del usuario (si quieres)
      if (session?.user?.email) {
        data.append("user_email", session.user.email)
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        body: data, // fetch detecta multipart/form-data automáticamente
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Error ${res.status}`)
      }

      const json = await res.json()
      setResult(json)
      // Feedback rápido al usuario
      alert("Miniatura encolada correctamente. Job ID: " + (json.jobId || json.id || "desconocido"))
    } catch (err) {
      console.error("Error enviando formulario:", err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
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
          {session.user?.image && (
            <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full" />
          )}
          <button
            onClick={() => signOut()}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 1️⃣ Extraer info */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">1️⃣ Extraer información</h2>

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="enable_description"
              checked={enabledFields.enable_description}
              onChange={handleChange}
            />
            Prompt / Descripción de la miniatura
          </label>
          {enabledFields.enable_description && (
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
            <input
              type="checkbox"
              name="enable_category"
              checked={enabledFields.enable_category}
              onChange={handleChange}
            />
            Categoría
          </label>
          {enabledFields.enable_category && (
            <select name="category" value={formData.category} onChange={handleChange} className="p-2 rounded bg-gray-800">
              <option value="">Selecciona</option>
              <option value="Gaming">Gaming</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Vlog">Vlog</option>
              <option value="Educación">Educación</option>
            </select>
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_videoFile"
              checked={enabledFields.enable_videoFile}
              onChange={handleChange}
            />
            Subir video para analizar plot
          </label>
          {enabledFields.enable_videoFile && (
            <input type="file" name="videoFile" accept="video/*" onChange={handleChange} />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_videoPlot"
              checked={enabledFields.enable_videoPlot}
              onChange={handleChange}
            />
            Escribir plot del video
          </label>
          {enabledFields.enable_videoPlot && (
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

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="enable_titleText"
              checked={enabledFields.enable_titleText}
              onChange={handleChange}
            />
            Texto en la miniatura
          </label>
          {enabledFields.enable_titleText && (
            <input
              type="text"
              name="titleText"
              placeholder="Ejemplo: ¡No creerás lo que pasó!"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.titleText}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_titleColor"
              checked={enabledFields.enable_titleColor}
              onChange={handleChange}
            />
            Color del texto
          </label>
          {enabledFields.enable_titleColor && (
            <input type="color" name="titleColor" value={formData.titleColor} onChange={handleChange} />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_mainColors"
              checked={enabledFields.enable_mainColors}
              onChange={handleChange}
            />
            Colores principales
          </label>
          {enabledFields.enable_mainColors && (
            <input
              type="text"
              name="mainColors"
              placeholder="Ejemplo: #FF0000, #00FF00"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.mainColors}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_referenceImages"
              checked={enabledFields.enable_referenceImages}
              onChange={handleChange}
            />
            Imágenes de referencia
          </label>
          {enabledFields.enable_referenceImages && (
            <input type="file" name="referenceImages" accept="image/*" multiple onChange={handleChange} />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_emojis"
              checked={enabledFields.enable_emojis}
              onChange={handleChange}
            />
            Emojis o stickers
          </label>
          {enabledFields.enable_emojis && (
            <input
              type="text"
              name="emojis"
              placeholder="Ejemplo: 😂🔥🎮"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.emojis}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_format"
              checked={enabledFields.enable_format}
              onChange={handleChange}
            />
            Formato
          </label>
          {enabledFields.enable_format && (
            <select name="format" value={formData.format} onChange={handleChange} className="p-2 rounded bg-gray-800">
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (Instagram)</option>
              <option value="9:16">9:16 (Shorts/TikTok)</option>
            </select>
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_clickbaitLevel"
              checked={enabledFields.enable_clickbaitLevel}
              onChange={handleChange}
            />
            Nivel de clickbait
          </label>
          {enabledFields.enable_clickbaitLevel && (
            <input
              type="range"
              min="0"
              max="100"
              name="clickbaitLevel"
              value={formData.clickbaitLevel}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_numFaces"
              checked={enabledFields.enable_numFaces}
              onChange={handleChange}
            />
            Número de caras
          </label>
          {enabledFields.enable_numFaces && (
            <input
              type="number"
              min="0"
              max="10"
              name="numFaces"
              className="p-2 rounded bg-gray-800"
              value={formData.numFaces}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_visualElements"
              checked={enabledFields.enable_visualElements}
              onChange={handleChange}
            />
            Elementos visuales
          </label>
          {enabledFields.enable_visualElements && (
            <input
              type="text"
              name="visualElements"
              placeholder="Ejemplo: rayos, flechas, círculos"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.visualElements}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_additionalText"
              checked={enabledFields.enable_additionalText}
              onChange={handleChange}
            />
            Texto adicional
          </label>
          {enabledFields.enable_additionalText && (
            <textarea
              name="additionalText"
              placeholder="Escribe frases o textos secundarios..."
              className="p-2 w-full rounded bg-gray-800"
              value={formData.additionalText}
              onChange={handleChange}
            />
          )}
        </div>

        {/* 3️⃣ Puntos adicionales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Puntos adicionales</h2>

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="enable_numResults"
              checked={enabledFields.enable_numResults}
              onChange={handleChange}
            />
            Número de miniaturas a generar
          </label>
          {enabledFields.enable_numResults && (
            <input
              type="number"
              min="1"
              max="20"
              name="numResults"
              className="p-2 rounded bg-gray-800"
              value={formData.numResults}
              onChange={handleChange}
            />
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_polarize"
              checked={enabledFields.enable_polarize}
              onChange={handleChange}
            />
            Polarización de resultados
          </label>
          {enabledFields.enable_polarize && (
            <label className="flex gap-2 items-center mt-2">
              <input
                type="checkbox"
                name="polarize"
                checked={formData.polarize}
                onChange={handleChange}
              />
              Generar variantes muy diferentes
            </label>
          )}

          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="enable_template"
              checked={enabledFields.enable_template}
              onChange={handleChange}
            />
            Plantilla base
          </label>
          {enabledFields.enable_template && (
            <input
              type="text"
              name="template"
              placeholder="Ejemplo: Plantilla inspirada en MrBeast"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.template}
              onChange={handleChange}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition mt-4 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Procesar"}
        </button>
      </form>

      {/* Resultado / error */}
      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="font-bold text-lg mb-2">Resultado:</h3>
          <pre className="text-sm overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-700 rounded">
          <p>❌ Error: {error}</p>
        </div>
      )}
    </div>
  )
}
