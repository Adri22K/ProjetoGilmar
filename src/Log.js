import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  texto: { type: String, required: true },            // a notícia / manchete
  resultado: { type: String, required: true },        // "Verdadeira", "Falsa", "Duvidosa"
  confidence: { type: Number, default: null },        // opcional: confiança do modelo
  metadata: { type: Object, default: {} },            // opcional: resposta completa da API
  createdAt: { type: Date, default: () => new Date() }
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);