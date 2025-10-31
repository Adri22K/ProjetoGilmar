  const form = document.getElementById('checkForm');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');
        const submitBtn = document.getElementById('submitBtn');
        const apiKeyInput = document.getElementById('apiKey');

        let apiKey = '';
        apiKeyInput.addEventListener('change', (e) => {
            apiKey = e.target.value.trim();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newsText = document.getElementById('newsText').value;
            
            if (!apiKey) {
                alert('Por favor, insira sua chave da API Google Gemini primeiro!');
                return;
            }

            // Oculta resultado anterior
            result.style.display = 'none';
            result.className = 'result';
            
            // Mostra loading
            loading.style.display = 'block';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Você é um especialista em verificação de fatos e detecção de fake news. Analise o texto fornecido e retorne APENAS um JSON válido no seguinte formato:

{
  "isFake": true ou false ou null,
  "confidence": número entre 0 e 100,
  "explanation": "explicação detalhada em português"
}

Critérios de análise:
- isFake: true = possível fake news, false = aparenta ser verdadeiro, null = inconclusivo
- confidence: nível de certeza da análise (0-100)
- explanation: análise detalhada explicando os motivos da classificação

Considere: sensacionalismo, fontes citadas, lógica, linguagem emotiva, afirmações extraordinárias sem evidências, padrões típicos de desinformação.

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.

Texto para analisar:
${newsText}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.3,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        }
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
                console.error('Erro:', error);
                displayResult({
                    isFake: null,
                    confidence: 0,
                    explanation: `Erro: ${error.message}. Verifique se sua chave da API está correta. A API do Google Gemini é 100% gratuita!`
                });
            } finally {
                loading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        function parseGeminiResponse(text) {
            try {
                // Remove markdown code blocks se existirem
                let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                
                // Tenta encontrar o JSON no texto
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
                console.error('Erro ao fazer parse:', error, 'Texto:', text);
                
                // Análise de fallback baseada em palavras-chave
                const lowerText = text.toLowerCase();
                let isFake = null;
                let confidence = 50;
                let explanation = text;
                
                if (lowerText.includes('fake') || lowerText.includes('falsa') || lowerText.includes('desinformação') || 
                    lowerText.includes('possivelmente falsa') || lowerText.includes('não confiável')) {
                    isFake = true;
                    confidence = 75;
                } else if (lowerText.includes('verdadeira') || lowerText.includes('confiável') || 
                           lowerText.includes('legítima') || lowerText.includes('verificável')) {
                    isFake = false;
                    confidence = 75;
                }
                
                return { isFake, confidence, explanation };
            }
        }

        function displayResult(data) {
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
                resultIcon.textContent = '⚡';
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