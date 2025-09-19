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
    mainColors: "#FF0000,#00FF00,#0000FF",
    format: "16:9",
    clickbaitLevel: "50",
    numFaces: 1,
    additionalText: "",
    numResults: 3,
    template: "",
  });

  const [enabledFields, setEnabledFields] = useState({
    description: false,
    category: false,
    videoPlot: false,
    titleText: false,
    titleColor: false,
    mainColors: false,
    format: false,
    clickbaitLevel: false,
    numFaces: false,
    additionalText: false,
    numResults: false,
    template: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name in enabledFields) {
      setEnabledFields((prev) => ({ ...prev, [name]: checked }));
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

    try {
      const res = await fetch("/api/create-thumbnail", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("✅ Respuesta del servidor:", data);
      alert("Miniaturas generadas correctamente. Revisa la consola.");
    } catch (err) {
      console.error("❌ Error enviando formulario:", err);
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

  // Paleta de colores para selects visuales
  const colorOptions = [
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF",
    "#00FFFF", "#000000", "#FFFFFF", "#FFA500", "#800080",
    "#008080", "#FFC0CB", "#808000", "#A52A2A"
  ];

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

          {/* Descripción */}
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="description"
              checked={enabledFields.description}
              onChange={handleChange}
            />
            Prompt / Descripción
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

          {/* Texto miniatura */}
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

          {/* Color del texto */}
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

          {/* Formato */}
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
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </select>
          )}

          {/* Nivel de clickbait */}
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
            <select
              name="clickbaitLevel"
              value={formData.clickbaitLevel}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
            </select>
          )}
        </div>

        {/* 3️⃣ Puntos adicionales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Puntos adicionales</h2>

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
            <select
              name="numFaces"
              value={formData.numFaces}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
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

          {/* Número de miniaturas */}
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
