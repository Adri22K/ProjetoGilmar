import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI not set in .env");
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro ao conectar MongoDB:", err);
    process.exit(1);
  }
}

export async function closeDB() {
  await mongoose.connection.close();
}