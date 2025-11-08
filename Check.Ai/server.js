// server.js

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json()); // Para parsear o corpo de requisições JSON
app.use(express.static(path.join(__dirname))); // Serve os arquivos estáticos (html, css, js)

// Configuração do Banco de Dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Cria a tabela de histórico se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            originalText TEXT NOT NULL,
            isFake BOOLEAN,
            confidence INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// --- ROTA PARA A VERIFICAÇÃO DE NOTÍCIAS (PROXY PARA O GEMINI) ---
app.post('/api/check', async (req, res) => {
    const { newsText } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!newsText) {
        return res.status(400).json({ error: 'O texto da notícia é obrigatório.' });
    }
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Chave da API do Gemini não configurada no servidor.' });
    }

    try {
        const prompt = `Você é um especialista em verificação de fatos. Analise o texto e retorne APENAS um JSON válido no formato:
{
  "isFake": true, false ou null,
  "confidence": um número entre 0 e 100,
  "explanation": "uma explicação detalhada em português"
}
Texto para analisar: "${newsText}"`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro na API do Google Gemini');
        }

        const data = await response.json();
        const geminiText = data.candidates[0].content.parts[0].text;
        
        // Retorna a resposta do Gemini para o front-end
        res.json({ geminiText });

    } catch (error) {
        console.error('Erro no proxy para o Gemini:', error);
        res.status(500).json({ error: error.message });
    }
});


// --- ROTAS DA API PARA O HISTÓRICO ---

// GET /api/history - Retorna todo o histórico
app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM history ORDER BY timestamp DESC LIMIT 50", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/history - Salva uma nova análise no histórico
app.post('/api/history', (req, res) => {
    const { originalText, isFake, confidence, explanation } = req.body;
    const sql = `INSERT INTO history (originalText, isFake, confidence, explanation) VALUES (?, ?, ?, ?)`;
    db.run(sql, [originalText, isFake, confidence, explanation], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// DELETE /api/history - Limpa todo o histórico
app.delete('/api/history', (req, res) => {
    db.run("DELETE FROM history", [], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: `Histórico limpo. ${this.changes} registros removidos.` });
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
