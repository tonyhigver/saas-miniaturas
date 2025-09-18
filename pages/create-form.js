// pages/create-form.js
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function CreateForm() {
  const { data: session } = useSession();
  const router = useRouter();

  // Estado de los campos del formulario
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    videoFile: null,
    videoPlot: "",
    titleText: "",
    titleColor: "#FFFFFF",
    mainColors: "",
    referenceImages: null,
    emojis: "",
    format: "16:9",
    clickbaitLevel: 50,
    numFaces: 1,
    visualElements: "",
    additionalText: "",
    numResults: 3,
    polarize: false,
    template: "",
  });

  // Estado para mostrar/ocultar campos
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name in enabledFields) {
      // Checkbox que habilita/deshabilita campos
      setEnabledFields((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "checkbox") {
      // Checkbox normal que forma parte del formData
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      // Archivos
      setFormData((prev) => ({ ...prev, [name]: files }));
    } else {
      // Texto, select, number, range, color, etc.
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    for (const key in formData) {
      const value = formData[key];
      if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          fd.append(key, value[i], value[i].name);
        }
      } else if (Array.isArray(value)) {
        value.forEach((v) => fd.append(key, v));
      } else {
        fd.append(key, value);
      }
    }

    // Depuración de los datos enviados
    for (let pair of fd.entries()) {
      console.log("➡ Enviando al API:", pair[0], pair[1]);
    }

    try {
      const res = await fetch("/api/create-thumbnail", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);
      alert("Miniaturas generadas correctamente. Revisa la consola.");
    } catch (err) {
      console.error("Error enviando formulario:", err);
      alert("Error al enviar los datos");
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <p>No has iniciado sesión.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Crear Miniatura con Formulario</h1>
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
          <button
            onClick={() => router.back()}
            className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Salir
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 1️⃣ Extraer info */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">1️⃣ Extraer información</h2>

          {/* Description */}
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="description"
              checked={enabledFields.description}
              onChange={handleChange}
            />
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

          {/* Category */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="category"
              checked={enabledFields.category}
              onChange={handleChange}
            />
            Categoría
          </label>
          {enabledFields.category && (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              <option value="">Selecciona</option>
              <option value="Gaming">Gaming</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Vlog">Vlog</option>
              <option value="Educación">Educación</option>
            </select>
          )}

          {/* Video File */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="videoFile"
              checked={enabledFields.videoFile}
              onChange={handleChange}
            />
            Subir video para analizar plot
          </label>
          {enabledFields.videoFile && (
            <input
              type="file"
              name="videoFile"
              accept="video/*"
              onChange={handleChange}
            />
          )}

          {/* Video Plot */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="videoPlot"
              checked={enabledFields.videoPlot}
              onChange={handleChange}
            />
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

          {/* Title Text */}
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="titleText"
              checked={enabledFields.titleText}
              onChange={handleChange}
            />
            Texto en la miniatura
          </label>
          {enabledFields.titleText && (
            <input
              type="text"
              name="titleText"
              placeholder="Ejemplo: ¡No creerás lo que pasó!"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.titleText}
              onChange={handleChange}
            />
          )}

          {/* Title Color */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="titleColor"
              checked={enabledFields.titleColor}
              onChange={handleChange}
            />
            Color del texto
          </label>
          {enabledFields.titleColor && (
            <input
              type="color"
              name="titleColor"
              value={formData.titleColor}
              onChange={handleChange}
            />
          )}

          {/* Main Colors */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="mainColors"
              checked={enabledFields.mainColors}
              onChange={handleChange}
            />
            Colores principales
          </label>
          {enabledFields.mainColors && (
            <input
              type="text"
              name="mainColors"
              placeholder="Ejemplo: #FF0000, #00FF00"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.mainColors}
              onChange={handleChange}
            />
          )}

          {/* Reference Images */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="referenceImages"
              checked={enabledFields.referenceImages}
              onChange={handleChange}
            />
            Imágenes de referencia
          </label>
          {enabledFields.referenceImages && (
            <input
              type="file"
              name="referenceImages"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
          )}

          {/* Emojis */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="emojis"
              checked={enabledFields.emojis}
              onChange={handleChange}
            />
            Emojis o stickers
          </label>
          {enabledFields.emojis && (
            <input
              type="text"
              name="emojis"
              placeholder="Ejemplo: 😂🔥🎮"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.emojis}
              onChange={handleChange}
            />
          )}

          {/* Format */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="format"
              checked={enabledFields.format}
              onChange={handleChange}
            />
            Formato
          </label>
          {enabledFields.format && (
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (Instagram)</option>
              <option value="9:16">9:16 (Shorts/TikTok)</option>
            </select>
          )}

          {/* Clickbait Level */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="clickbaitLevel"
              checked={enabledFields.clickbaitLevel}
              onChange={handleChange}
            />
            Nivel de clickbait
          </label>
          {enabledFields.clickbaitLevel && (
            <input
              type="range"
              min="0"
              max="100"
              name="clickbaitLevel"
              value={formData.clickbaitLevel}
              onChange={handleChange}
            />
          )}

          {/* Num Faces */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="numFaces"
              checked={enabledFields.numFaces}
              onChange={handleChange}
            />
            Número de caras
          </label>
          {enabledFields.numFaces && (
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

          {/* Visual Elements */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="visualElements"
              checked={enabledFields.visualElements}
              onChange={handleChange}
            />
            Elementos visuales
          </label>
          {enabledFields.visualElements && (
            <input
              type="text"
              name="visualElements"
              placeholder="Ejemplo: rayos, flechas, círculos"
              className="p-2 w-full rounded bg-gray-800"
              value={formData.visualElements}
              onChange={handleChange}
            />
          )}

          {/* Additional Text */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="additionalText"
              checked={enabledFields.additionalText}
              onChange={handleChange}
            />
            Texto adicional
          </label>
          {enabledFields.additionalText && (
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

          {/* Num Results */}
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="numResults"
              checked={enabledFields.numResults}
              onChange={handleChange}
            />
            Número de miniaturas a generar
          </label>
          {enabledFields.numResults && (
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

          {/* Polarize */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="polarize"
              checked={enabledFields.polarize}
              onChange={handleChange}
            />
            Polarización de resultados
          </label>
          {enabledFields.polarize && (
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="polarize"
                checked={formData.polarize}
                onChange={handleChange}
              />
              Generar variantes muy diferentes
            </label>
          )}

          {/* Template */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="template"
              checked={enabledFields.template}
              onChange={handleChange}
            />
            Plantilla base
          </label>
          {enabledFields.template && (
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
          className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition mt-4"
        >
          Procesar
        </button>
      </form>
    </div>
  );
}
