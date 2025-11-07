# 🔍 Check.AI - Verificador de Notícias 

Este projeto foi desenvolvido como parte da disciplina Tópicos Avançados em **Sistemas de Informação II, lecionada pelo Professor Gilmar Alexandre Do Prado Yahuita**
com o objetivo de criar uma miniaplicação inteligente capaz de analisar e validar notícias, identificando se elas são verídicas ou Fake News.

A aplicação utiliza a **IA do Google Gemini**, aproveitando seus recursos de processamento de
linguagem natural (NLP) para interpretar o conteúdo textual das notícias e emitir uma avaliação automática sobre sua confiabilidade.

## 🚀 O que o Check.AI faz

Você cola uma notícia → a IA analisa → o sistema te mostra o resultado.


# 💻 Tecnologias Utilizadas

**Ambiente de desenvolvimento**
- VSCode – Editor de códigos;
- Git & GitHub – Versionamento e hospedagem do repositório;

**Frontend**
- HTML5 – Estrutura da interface;
- CSS3 – Estilização e layout;
- JavaScript – Lógica da interação com o usuário e consumo da API;
  
**Backend**
- dotenv – Armazenar e gerenciar variáveis de ambiente (ex: chave da API);
- Node.js – ambiente de execução JavaScript  
  
**Inteligência Artificial**
- Google Gemini API – Modelo de IA utilizado para analisar o texto e classificar a notícia como “Verdadeira”, “Falsa” ou “Duvidosa”;<br>_A API pode ser usada gratuitamente através Google AI Studio._

**Banco de Dados**
- O projeto utiliza MongoDB Atlas para armazenar os logs de validações.
As credenciais de conexão devem ser configuradas no arquivo .env usando a variável MONGO_URI.

## ⚙️ Conexões e segurança

- A chave da IA (`GEMINI_API_KEY`) e a conexão do banco (`MONGO_URI`) ficam armazenadas em um arquivo `.env`, que **nunca deve ser enviado para o GitHub**.  
- Isso garante a **segurança dos dados e das credenciais** da aplicação.

## 💻 Como usar o Check.AI

### 1️⃣ Acesse o sistema
Abra o **Check.AI** no navegador.  

### 2️⃣ Cole a notícia
Copie e cole o texto, manchete ou link da notícia que você quer verificar no campo principal.

✏️ **Exemplo:**
> “Trump está planejando viajar para o Brasil e soltar Bolsonaro que está preso em Tremembé.”

### 3️⃣ Clique em **Verificar**
O sistema vai enviar o texto para a IA, processar a resposta e mostrar o resultado na tela.

### 4️⃣ Veja o resultado
Você verá algo como:

- **Resultado:** Possível Fake News  
- **Motivo:** “Altamente improvável e não possui qualquer evidência ou fonte confiável.”
- **Confiança:** 99%

### 5️⃣ Consulte o histórico
Abaixo dos resultados, há uma lista das últimas 3 notícias analisadas.  


# 👥 Integrantes

- Adrielle Stollemberger 
- Nicolas Santos
- Victor Almeida
- João Almeida
- Samir Abdul
- Caua Pacheco

