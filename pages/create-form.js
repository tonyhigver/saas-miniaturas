// pages/create-form.js
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function CreateForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    description: "",
    category: "",
    videoPlot: "",
    titleText: "",
    titleColor: "#FF0000",
    mainColors: "#FF0000",
    format: "16:9",
    numFaces: 1,
    visualElements: "",
    additionalText: "",
    numResults: 3,
    template: "",
    clickbaitLevel: "50%",
    facesImage: null, // archivo
  });

  const [enabledFields, setEnabledFields] = useState({
    description: false,
    category: false,
    videoPlot: false,
    titleText: false,
    titleColor: false,
    mainColors: false,
    format: false,
    numFaces: false,
    visualElements: false,
    additionalText: false,
    numResults: false,
    template: false,
    clickbaitLevel: false,
    facesImage: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name in enabledFields) {
      setEnabledFields((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    for (const key in formData) {
      if (enabledFields[key]) {
        fd.append(key, formData[key]);
      }
    }

    for (let pair of fd.entries()) {
      console.log("➡ Enviando al API:", pair[0], pair[1]);
    }

    try {
      const res = await fetch("/api/create-form", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

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

  // 🎨 Opciones de colores y clickbait
  const colorOptions = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];
  const clickbaitOptions = ["25%", "50%", "75%", "100%"];

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
        {/* 1️⃣ Extraer información */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">1️⃣ Extraer información</h2>

          {/* Prompt */}
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

          {/* Categoría */}
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

          {/* Plot */}
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

          {/* Texto en la miniatura */}
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

          {/* Color del título */}
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
            <select
              name="titleColor"
              value={formData.titleColor}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          )}

          {/* Colores principales */}
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
            <select
              name="mainColors"
              value={formData.mainColors}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 3️⃣ Puntos adicionales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Puntos adicionales</h2>

          {/* Nivel de Clickbait */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="clickbaitLevel"
              checked={enabledFields.clickbaitLevel}
              onChange={handleChange}
            />
            Nivel de Clickbait
          </label>
          {enabledFields.clickbaitLevel && (
            <select
              name="clickbaitLevel"
              value={formData.clickbaitLevel}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              {clickbaitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Número de caras */}
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

          {/* Imagen de caras */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="facesImage"
              checked={enabledFields.facesImage}
              onChange={handleChange}
            />
            Subir imagen de las caras
          </label>
          {enabledFields.facesImage && (
            <input
              type="file"
              name="facesImage"
              accept="image/*"
              className="p-2 w-full rounded bg-gray-800"
              onChange={handleChange}
            />
          )}

          {/* Elementos visuales */}
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

          {/* Texto adicional */}
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

          {/* Número de resultados */}
          <label className="flex gap-2 items-center mt-3">
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

          {/* Plantilla */}
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
