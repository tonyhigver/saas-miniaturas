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
    primaryColor: "#FF0000",
    numFaces: 1,
    visualElementsText: "",
    visualElementsImage: null,
    faceImage: null,
    additionalText: "",
    textColor: "#FF0000",
    numResults: 3,
    template: "",
    format: "",
    clickbait: "",
  });

  const [enabledFields, setEnabledFields] = useState({
    description: false,
    category: false,
    videoPlot: false,
    titleText: false,
    primaryColor: false,
    numFaces: false,
    visualElementsText: false,
    visualElementsImage: false,
    faceImage: false,
    additionalText: false,
    textColor: false,
    numResults: false,
    template: false,
    format: false,
    clickbait: false,
  });

  const [categorySearch, setCategorySearch] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name in enabledFields) {
      setEnabledFields((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    for (const key in formData) {
      if (enabledFields[key]) {
        payload.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch("/api/create-thumbnail", {
        method: "POST",
        body: payload,
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

  // 🎯 Opciones
  const colorOptions = [
    "#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF",
    "#000000","#FFFFFF","#FFA500","#800080","#008080","#FFC0CB",
    "#808000","#A52A2A","#ADD8E6","#F0E68C","#D2691E","#B22222"
  ];

  const formatOptions = ["YouTube", "Instagram", "Facebook", "TikTok"];
  const clickbaitOptions = ["25%", "50%", "75%", "100%"];

  // 📂 Categorías
  const categories = [
    {
      group: "Gaming",
      options: [
        "Gameplay", "Speedrun", "Retos / Challenges", "Tutoriales / Guías",
        "Esports / Torneos", "Let's Play", "Mods / Hacks / Experimentos", "Reacciones"
      ]
    },
    {
      group: "Vlogs / Lifestyle",
      options: [
        "Diario personal", "Viajes / Turismo", "Rutinas / Morning / Night routines",
        "Unboxing / Compras", "Fitness / Deportes", "Estilo de vida / Motivación"
      ]
    },
    {
      group: "Entretenimiento",
      options: [
        "Comedia / Sketches","Parodias / Imitaciones","Fails / Bromas / Pranks",
        "Reacciones / Reviews de películas o series","Animaciones / Motion graphics cortos",
        "Clips virales / Memes"
      ]
    },
    {
      group: "Educación / Tutoriales",
      options: [
        "Tutoriales paso a paso","Explicaciones científicas","Clases / Cursos online",
        "Lenguajes / Programación","Historia / Cultura"
      ]
    },
    {
      group: "Música / Arte",
      options: [
        "Covers / Interpretaciones musicales","Producción / Beat making / Remix",
        "Arte visual / Diseño","Performance / Danza","Tutoriales de instrumentos"
      ]
    },
    {
      group: "Noticias / Actualidad",
      options: [
        "Noticias rápidas / Breaking news","Debates / Opinión",
        "Eventos deportivos / cobertura en vivo","Resúmenes semanales"
      ]
    },
    {
      group: "DIY / Manualidades",
      options: [
        "Artesanía / Crafts","Reciclaje creativo / Upcycling",
        "Decoración / Hogar","Proyectos escolares / Experimentos simples"
      ]
    },
    {
      group: "Tecnología / Reviews",
      options: [
        "Unboxing / Hands-on","Comparaciones de productos","Tutoriales de software",
        "Trucos / Hacks / Tips","Gaming tech / Hardware / Gadgets"
      ]
    },
    {
      group: "Cocina / Comida",
      options: [
        "Recetas rápidas","Food challenges","Street food / Travel food",
        "Técnicas culinarias","Reseñas de restaurantes"
      ]
    },
    {
      group: "Lifestyle y motivación",
      options: [
        "Self-help / Motivación / Productividad","Minimalismo / Organización",
        "Fashion / Moda / Outfit del día","Beauty / Maquillaje / Haircare"
      ]
    },
    {
      group: "Extras (Miniaturas)",
      options: [
        "Texto grande y llamativo","Emojis / stickers",
        "Caras con expresiones exageradas","Flechas, círculos, zoom",
        "Fondos brillantes / explosivos"
      ]
    }
  ];

  const filteredCategories = categories.map(group => ({
    ...group,
    options: group.options.filter(opt =>
      opt.toLowerCase().includes(categorySearch.toLowerCase())
    )
  }));

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

          {/* Categoría con buscador */}
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
            <div className="mt-2">
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="p-2 w-full rounded bg-gray-700 mb-2"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-2 w-full rounded bg-gray-800"
              >
                <option value="">Selecciona categoría</option>
                {filteredCategories.map(group =>
                  group.options.length > 0 && (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  )
                )}
              </select>
            </div>
          )}

          {/* Video plot */}
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

          {/* Texto */}
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

          {/* Colores */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="primaryColor"
              checked={enabledFields.primaryColor}
              onChange={handleChange}
            />
            Color primario de la miniatura
          </label>
          {enabledFields.primaryColor && (
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => setFormData({ ...formData, primaryColor: color })}
                  className={`w-8 h-8 rounded cursor-pointer border-2 ${formData.primaryColor === color ? "border-white" : "border-gray-600"}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
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
              <option value="">Selecciona formato</option>
              {formatOptions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}

          {/* Clickbait */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="clickbait"
              checked={enabledFields.clickbait}
              onChange={handleChange}
            />
            Nivel de Clickbait
          </label>
          {enabledFields.clickbait && (
            <select
              name="clickbait"
              value={formData.clickbait}
              onChange={handleChange}
              className="p-2 rounded bg-gray-800"
            >
              <option value="">Selecciona nivel</option>
              {clickbaitOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Imagen cara */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="faceImage"
              checked={enabledFields.faceImage}
              onChange={handleChange}
            />
            Subir foto de la cara
          </label>
          {enabledFields.faceImage && (
            <input
              type="file"
              name="faceImage"
              accept="image/*"
              className="mt-2"
              onChange={handleChange}
            />
          )}

          {/* Elementos visuales */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="visualElementsImage"
              checked={enabledFields.visualElementsImage}
              onChange={handleChange}
            />
            Elementos visuales (imagen)
          </label>
          {enabledFields.visualElementsImage && (
            <input
              type="file"
              name="visualElementsImage"
              accept="image/*"
              className="mt-2"
              onChange={handleChange}
            />
          )}
        </div>

        {/* 3️⃣ Puntos adicionales */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3️⃣ Puntos adicionales</h2>

          {/* Num caras */}
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

          {/* Color del texto */}
          <label className="flex gap-2 items-center mt-3">
            <input
              type="checkbox"
              name="textColor"
              checked={enabledFields.textColor}
              onChange={handleChange}
            />
            Color del texto adicional
          </label>
          {enabledFields.textColor && (
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map(color => (
                <div
                  key={color}
                  onClick={() => setFormData({ ...formData, textColor: color })}
                  className={`w-8 h-8 rounded cursor-pointer border-2 ${formData.textColor === color ? "border-white" : "border-gray-600"}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Num resultados */}
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
