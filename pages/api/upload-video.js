// pages/api/upload-video.js
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // necesario para recibir FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Leemos la request como buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Construimos FormData para enviar a Hetzner
    const formData = new FormData();
    formData.append("video", buffer, {
      filename: req.headers["x-file-name"] || "video.mp4",
      contentType: req.headers["content-type"] || "video/mp4",
    });

    // Enviamos al backend Hetzner
    const backendRes = await fetch("http://157.180.88.215:4000/upload-video", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Error enviando a backend:", err);
    res.status(500).json({ error: "Error enviando a backend" });
  }
}
