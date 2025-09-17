export const config = {
  api: {
    bodyParser: false, // necesario para FormData
  },
};

import formidable from "formidable-serverless";
import fs from "fs";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const video = files.video;
    if (!video) return res.status(400).json({ error: "No file uploaded" });

    try {
      const fileStream = fs.createReadStream(video.filepath);
      const formData = new fetch.FormData();
      formData.append("video", fileStream, video.originalFilename);

      // Llamamos al backend Hetzner
      const backendRes = await fetch("http://157.180.88.215:4000/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await backendRes.json();
      res.status(backendRes.status).json(data);
    } catch (error) {
      console.error("Error enviando a backend:", error);
      res.status(500).json({ error: "Error enviando a backend" });
    }
  });
}
