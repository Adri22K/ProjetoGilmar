import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import { connectDB } from "./db.js";
import Log from "./Log.js";

dotenv.config();

console.log("🚀 Projeto CheckAI iniciado!");
console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? "OK" : "❌ Falta variável");
console.log("🔍 GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "OK" : "❌ Falta variável");

const app = express();
app.use(express.json());

await connectDB();

// Rota de teste
app.post("/api/validate", async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: "texto é obrigatório" });

    const resultado = "Duvidosa"; // simulação
    const confidence = 0.72;
    const metadata = { reason: "Checagem de fatos incompleta" };

    const log = await Log.create({ texto, resultado, confidence, metadata });
    return res.status(201).json({ ok: true, log });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
});

app.get("/api/logs", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const logs = await Log.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json({ page, limit, logs });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server rodando em http://localhost:${PORT}`));