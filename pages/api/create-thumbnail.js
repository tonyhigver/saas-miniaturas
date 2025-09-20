// pages/api/create-thumbnail.js
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { FormData } from "formdata-node";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const busboy = new Busboy({ headers: req.headers });
    const textFields = {};
    const uploadedFiles = [];

    const parsePromise = new Promise((resolve, reject) => {
      busboy.on("field", (fieldname, val) => {
        console.log("📝 Campo recibido:", fieldname, val);
        textFields[fieldname] = val;
      });

      busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        console.log(`📎 Archivo recibido: ${filename} (${mimetype})`);

        const saveTo = path.join("/tmp", filename);
        const writeStream = fs.createWriteStream(saveTo);
        file.pipe(writeStream);

        file.on("end", () => {
          uploadedFiles.push({ fieldname, path: saveTo, filename, mimetype });
        });
      });

      busboy.on("finish", () => resolve());
      busboy.on("error", (err) => reject(err));

      req.pipe(busboy);
    });

    await parsePromise;

    // 📦 Preparar datos para reenviar al backend
    const formData = new FormData();

    // Añadir campos de texto
    for (const key in textFields) {
      formData.append(key, textFields[key]);
    }

    // Añadir archivos
    uploadedFiles.forEach((file) => {
      formData.append(file.fieldname, fs.createReadStream(file.path), file.filename);
    });

    // 🚀 Reenviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders ? formData.getHeaders() : {},
    });

    const backendData = await backendRes.json();

    // 🧹 Limpiar archivos temporales
    uploadedFiles.forEach((file) => fs.unlinkSync(file.path));

    return res.status(200).json({
      message: "Formulario y archivos enviados correctamente ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando formulario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
