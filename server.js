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

// ⚙️ __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 servir archivos estáticos (index.html, etc.)
app.use(express.static(__dirname));

// ✅ comprobar que exista la API key
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ No se encontró OPENAI_API_KEY en las variables de entorno");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Formato inválido: falta 'messages'" });
  }

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
    console.error("❌ Error al generar respuesta:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Error al generar respuesta en el servidor" });
  }
});

// 👇 si alguien pide / que le dé el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔴 IMPORTANTE para Render: usar process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
