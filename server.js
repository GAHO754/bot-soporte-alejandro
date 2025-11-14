import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⚙️ esto es para poder usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 servir archivos estáticos (tu index.html)
app.use(express.static(__dirname)); // sirve lo que haya en la carpeta actual

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          Eres el asistente de soporte de la plataforma de Alejandro.
          Solo respondes cosas relacionadas con:
          - escaneo de documentos
          - registro de clientes
          - cámaras IP en restaurante
          - portal cautivo / wifi
          - tickets y puntos
          Si te preguntan algo fuera de esto, di que solo atiendes soporte de la app.
          Responde en español, corto y claro.
          `,
        },
        ...messages,
      ],
    });

    res.json({ reply: completion.choices[0].message });
  } catch (err) {
    console.error("❌ Error al generar respuesta:", err);
    res.status(500).json({ error: "Error al generar respuesta" });
  }
});

// 👇 si alguien pide / que le dé el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
