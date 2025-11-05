document.addEventListener('DOMContentLoaded', () => {
    // 💡 PASSO ÚNICO: Cole sua chave da API do Google Gemini aqui
    const GEMINI_API_KEY = "AIzaSyA-UhSCI98CqvaeYn9eSQAdkLTjfuUrUHQ";

    const form = document.getElementById('checkForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');
    const copyBtn = document.getElementById('copyResultBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newsText = document.getElementById('newsText').value;
        
        // A validação da chave foi removida daqui.
        
        result.style.display = 'none';
        result.className = 'result';
        
        loading.style.display = 'block';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Você é um especialista em verificação de fatos. Analise o texto e retorne APENAS um JSON válido no formato:
{
  "isFake": true, false ou null,
  "confidence": um número entre 0 e 100,
  "explanation": "uma explicação detalhada em português"
}
Texto para analisar: "${newsText}"`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Erro na API do Google Gemini');
            }

            const data = await response.json();
            const geminiText = data.candidates[0].content.parts[0].text;
            const analysis = parseGeminiResponse(geminiText);
            displayResult(analysis);
            
        } catch (error) {
            console.error('Erro na verificação:', error);
            // Mostra uma mensagem de erro para o usuário
            displayResult({
                isFake: null,
                confidence: 0,
                explanation: `Ocorreu um erro: ${error.message}. Verifique sua chave de API e a conexão com a internet.`
            });
        } finally {
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    function parseGeminiResponse(text) {
        try {
            let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }
            const parsed = JSON.parse(cleanText);
            return {
                isFake: parsed.isFake,
                confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
                explanation: parsed.explanation || 'Análise concluída.'
            };
        } catch (error) {
            console.error('Erro ao fazer parse da resposta:', error, 'Texto recebido:', text);
            return { isFake: null, confidence: 20, explanation: "A IA retornou uma resposta em um formato inesperado. Tente novamente." };
        }
    }

    function displayResult(data) {
        // (A função displayResult continua a mesma do código anterior)
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultText = document.getElementById('resultText');
        const confidenceText = document.getElementById('confidenceText');
        const confidenceFill = document.getElementById('confidenceFill');

        result.classList.remove('true', 'false', 'uncertain');

        if (data.isFake === true) {
            result.classList.add('false');
            resultIcon.textContent = '⚠️';
            resultTitle.textContent = 'Possível Fake News';
        } else if (data.isFake === false) {
            result.classList.add('true');
            resultIcon.textContent = '✓';
            resultTitle.textContent = 'Notícia Verificável';
        } else {
            result.classList.add('uncertain');
            resultIcon.textContent = '❓';
            resultTitle.textContent = 'Análise Inconclusiva';
        }

        resultText.textContent = data.explanation;
        confidenceText.textContent = Math.round(data.confidence) + '%';
        confidenceFill.style.width = '0%';
        
        result.style.display = 'block';
        
        setTimeout(() => {
            confidenceFill.style.width = data.confidence + '%';
        }, 100);
    }

    copyBtn.addEventListener('click', () => {
        const resultTitle = document.getElementById('resultTitle').textContent;
        const resultText = document.getElementById('resultText').textContent;
        const confidenceText = document.getElementById('confidenceText').textContent;

        const textToCopy = `Resultado da Análise (Check.IA):\n\n- Veredito: ${resultTitle}\n- Confiança: ${confidenceText}\n- Explicação: ${resultText}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copiado! ✅';
            copyBtn.disabled = true;
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar o resultado: ', err);
            alert('Não foi possível copiar a análise. Por favor, tente manualmente.');
        });
    });
});