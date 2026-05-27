import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Helper to interact with Gemini API using native fetch
async function generateGeminiContent(systemInstruction: string, promptContext: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not defined");
  }

  // Google AI Studio uses standard developer endpoints for Gemini 2.5 Flash
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: promptContext }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text returned in Gemini response candidates");
  }
  return text;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Orkut Character Simulated Replies (using Gemini 2.5 Flash)
  app.post("/api/reply", async (req, res) => {
    const { characterId, userName, userProfile, text, encrypt } = req.body;

    const characterPrompts: Record<string, string> = {
      alexandre: `Voce e o Alexandre Curi, deputado paranaense de Curitiba que ficou famoso no print do Orkut. 
Sua personalidade e amigavel, diplomatica, tipicamente politica do Sul do Brasil, mas agora voce e totalmente focado em ciberseguranca, Rust e criptografia avançada nos sistemas de votacao e servicos do Parana.
Responda ao scrap (recado) enviado pelo usuario (${userName}). Se o recado ${encrypt ? 'estava' : 'nao estava'} criptografado no canal, comente brevemente sobre a importancia da segurança da informacao. 
Mantenha a resposta com ate 3 frases de forma bem nostalgica e no linguajar sulista/curitibano de comeco dos anos 2000, as vezes mencionando pinhão, Curitiba ou a Assembleia Legislativa.`,
      
      orkut: `You are Orkut Büyükkökten, the legendary founder of Orkut.
You write in a charming mix of English and slightly broken, enthusiastic Portuguese (Portuglês). You are extremely sweet, nostalgic, and proud of the new secure model.
Explain to ${userName} how the old Orkut had vulnerabilities (like XSS cookie-stealing worms, profile hijacks) because security and memory safety (like Rust's borrow checker) weren't main stream in 2004. But now, with our client-side end-to-end cryptography and Rust-WASM backend, their scraps and testimonials are absolutely secure!
Keep it energetic, friendly, and limit to 3 sentences. Say "Hello my friend!" or similar.`,
      
      hacker: `Você é o "H3_Elit3_Hacker", um hacker experiente da velha guarda do Orkut dos anos 2000 (época do subseven, invasões de fórum por cookies e XSS nos depoimentos).
Sua missão é testar a segurança do sistema de forma sarcástica, mas técnica. Comente com os termos hackers da época (script kiddie, exploit, cookie hijacking, defaced).
Diga que as mensagens criptografadas em AES-GCM com assinaturas de chave no Rust-WASM quebraram totalmente seus scripts de invasão antigos e que você está impressionado. Se a mensagem do usuário ${userName} estiver criptografada, elogie o protocolo. Se não estiver, dê uma bronca nostálgica ("Cuidado para não pegar worm de depoimento!"). Mantenha a resposta sarcástica e técnica, limitada a 3 frases.`,
      
      lucas: `Você é o "Lucas Santos" (@Lucas_Santos), um jovem paulistano amigável e nostálgico dos anos 2000 que adora bater papo por chat de MSN e Orkut de madrugada.
Sua fala é extremamente informal e rápida, típica dos mensageiros antigos (utilizando abreviações como "parça", "cola ai", "mano", "kkk", "blz", "vlw", "tbm").
Responda diretamente à mensagem privada no chat de forma curta e coloquial (com no máximo 1 ou 2 frases curtas), no estilo de mensagens de chat em tempo real. Pode citar que vai tomar banho, que está saindo pra praça, ou perguntar o que o usuário está programando em Rust.`
    };

    const targetPrompt = characterPrompts[characterId] || "Você é um usuário nostálgico do Orkut. Responda em tom amigável de 2004.";

    const hasApiKey = !!process.env.GEMINI_API_KEY;

    if (!hasApiKey) {
      // Fallback simulated replies
      const offlineFallbacks: Record<string, string> = {
        alexandre: `Fala, ${userName}! Que legal ver você se importando com criptografia aqui no Paraná. Estamos implementando segurança de estado na Assembleia com Rust para que nenhum hacker de Curitiba intercepte nossos depoimentos. Um abraço chapa, venha comer pinhão com a gente! [Simulação Offline]`,
        orkut: `Hello ${userName}! I am so happy you are here in Orkut Secure! In 2004 we had some bad code, but now with WebCrypto and Rust safety, we are 100% immune to CSS/XSS. Keep sharing your scrapbooks safely! Cheers! [Simulação Offline]`,
        hacker: `Putz, ${userName}... Fui tentar ler seus scraps pela rede local para sequestrar seu cookie, mas esse esquema AES-GCM que o Rust-WASM validou me brotou zero chance. Só sobrou tela preta pro meu script antigo de 2004. Excelente segurança, mané! [Simulação Offline]`,
        lucas: `Fala, parça! Beleza? To acabando de arrumar as coisas aqui, só vou tomar um banho e já to saindo. A gente se tromba na praça! kkk vlw [Simulação Offline]`
      };
      const offlineReply = offlineFallbacks[characterId] || `Olá ${userName}, sua mensagem secreta de Orkut Secure foi processada localmente com integridade garantida!`;
      return res.json({ reply: offlineReply, encrypted: encrypt });
    }

    try {
      const promptContext = `
Usuario Orkut: ${userName}
Biografia do Usuario: ${userProfile || "Nenhuma biografia fornecida."}
Mensagem enviada no scrapbook (recado): "${text}"
Criptografada na origem? ${encrypt ? "SIM (AES-256-GCM / assinaturas RSA)" : "NÃO (Canal de texto puro)"}

Crie a resposta do personagem de acordo com as diretrizes indicadas. Responda diretamente ao scrapbook, sem introduções de narrador, em nome da persona.`;

      const replyText = await generateGeminiContent(targetPrompt, promptContext);
      return res.json({ reply: replyText, encrypted: encrypt });
    } catch (err) {
      console.error("Gemini API Error in Orkut API backend:", err);
      // Fallback on HTTP failures
      const offlineFallbacks: Record<string, string> = {
        alexandre: `Fala, ${userName}! Que legal ver você aqui no Paraná. Estamos reforçando a segurança dos recados. Um abraço chapa! [Fallback Off]`,
        orkut: `Hello my friend ${userName}! High-security is our vision. Everything is 100% secure. [Fallback Off]`,
        hacker: `Erro de rede ou cota esgotada, mano. Mas o algoritmo de cifra está intacto contra deface! [Fallback Off]`
      };
      const fallbackReply = offlineFallbacks[characterId] || `Olá ${userName}, recebido com sucesso!`;
      return res.json({ reply: fallbackReply, encrypted: encrypt });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Orkut Secure backend server listening on PORT: http://localhost:${PORT}`);
  });
}

startServer();
