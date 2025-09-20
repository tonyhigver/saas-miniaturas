// pages/api/create-thumbnail.js
import formidable from "formidable";
import Busboy from "busboy";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// ⛔ Desactivar bodyParser de Next.js
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // ----------------------------
    // 1️⃣ Procesar campos de texto
    // ----------------------------
    const form = formidable({ multiples: false });

    const textFields = await new Promise((resolve, reject) => {
      const fieldsObj = {};

      form.on("field", (name, value) => {
        console.log("🔹 Campo de texto recibido:", name, value);
        fieldsObj[name] = value;
      });

      form.on("error", (err) => {
        console.error("❌ Error en Formidable:", err);
        reject(err);
      });

      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else resolve(fieldsObj);
      });
    });

    // ----------------------------
    // 2️⃣ Procesar archivos (imágenes/video)
    // ----------------------------
    const busboy = new Busboy({ headers: req.headers });
    const uploadedFiles = [];

    const filesPromise = new Promise((resolve, reject) => {
      busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        console.log(`📎 Archivo recibido: ${filename} (${mimetype})`);

        const saveTo = path.join("/tmp", filename);
        const writeStream = fs.createWriteStream(saveTo);
        file.pipe(writeStream);

        file.on("end", () => {
          uploadedFiles.push({ fieldname, path: saveTo, filename, mimetype });
        });
      });

      busboy.on("error", (err) => {
        console.error("❌ Error en Busboy:", err);
        reject(err);
      });

      busboy.on("finish", () => {
        resolve(uploadedFiles);
      });

      req.pipe(busboy);
    });

    const files = await filesPromise;

    // ----------------------------
    // 3️⃣ Preparar FormData para enviar al backend
    // ----------------------------
    const { FormData } = require("formdata-node");
    const formData = new FormData();

    // Agregar campos de texto
    for (const key in textFields) {
      formData.append(key, textFields[key]);
    }

    // Agregar archivos
    files.forEach((file) => {
      formData.append(file.fieldname, fs.createReadStream(file.path), file.filename);
    });

    // Enviar al backend
    const backendRes = await fetch("http://157.180.88.215:4000/create-thumbnail", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders ? formData.getHeaders() : {},
    });

    const backendData = await backendRes.json();

    // Limpiar archivos temporales
    files.forEach((file) => fs.unlinkSync(file.path));

    return res.status(200).json({
      message: "Formulario y archivos enviados correctamente ✅",
      backendResponse: backendData,
    });
  } catch (error) {
    console.error("❌ Error procesando formulario y archivos:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}
