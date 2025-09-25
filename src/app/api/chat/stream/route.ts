export const runtime = "nodejs";

type RawMsg = { role: "system" | "user" | "assistant"; content: string };
type GeminiMsg = { role: "user" | "model"; parts: Array<{ text: string }> };

function normalizeForGemini(raw: RawMsg[]): GeminiMsg[] {
  const sys = raw
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n")
    .trim();
  const rest = raw.filter((m) => m.role !== "system");

  const mapped: GeminiMsg[] = [];
  let firstUserInjected = false;

  for (const m of rest) {
    if (!m?.content?.trim()) continue;

    if (m.role === "assistant") {
      mapped.push({ role: "model", parts: [{ text: m.content }] });
    } else {
      // user
      const text = !firstUserInjected && sys ? `${sys}\n\n${m.content}` : m.content;
      mapped.push({ role: "user", parts: [{ text }] });
      firstUserInjected = true;
    }
  }

  if (!firstUserInjected && sys) {
    mapped.unshift({ role: "user", parts: [{ text: sys }] });
    firstUserInjected = true;
  }

  // Reglas de Gemini: debe empezar con "user", alternar (user/model/user/...)
  // Si el primero no es user, anteponemos un user vacío para cumplir.
  if (mapped.length && mapped[0].role !== "user") {
    mapped.unshift({ role: "user", parts: [{ text: "Contexto inicial" }] });
  }

  // Elimina posibles parts vacíos y asegúrate de que cada parts tiene text
  return mapped.map((m) => ({ role: m.role, parts: m.parts.filter((p) => p?.text?.trim()).map((p) => ({ text: p.text })) })).filter((m) => m.parts.length > 0);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: RawMsg[] = body?.messages ?? [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Bad request: messages vacío", { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return new Response("Server misconfig: GEMINI_API_KEY", { status: 500 });
    }

    const contents = normalizeForGemini(messages);
    if (contents.length === 0) {
      return new Response("Bad request: payload vacío tras normalizar", { status: 400 });
    }

    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const systemInstruction = {
      role: "user", // Gemini v1beta usa esta forma
      parts: [
        {
          text: `Eres "Asistente de MusicAula".
                  Responde en **español**, de forma **breve y accionable**:
                  - Máximo 7 viñetas o 120–180 palabras.
                  - Usa **títulos cortos** y listas con "-" o números.
                  - Ejemplos concretos y compactos.
                  - Nada de relleno ni emojis; evita párrafos largos.
                  - Si corresponde, incluye bloques de código/tablitas en Markdown.`,
        },
      ],
    };

    const generationConfig = {
      temperature: 0.6,
      topP: 0.9,
      candidateCount: 1,
      maxOutputTokens: 220, // 👈 cap de longitud
    };

    // build final payload:
    const payload = {
      contents, // (los messages normalizados que ya tienes)
      systemInstruction, // 👈 estilo global
      generationConfig, // 👈 control de longitud y aleatoriedad
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Si falla, devuelve el texto del error de Google para ver la causa exacta
    if (!upstream.ok) {
      const txt = await upstream.text();
      // ⚠️ sólo para depurar. En producción, loguéalo y devuelve 502 genérico.
      return new Response(`Gemini ${upstream.status}: ${txt}`, { status: 502 });
    }

    const j = await upstream.json();
    const parts = j?.candidates?.[0]?.content?.parts ?? [];
    const fullText = parts.map((p: any) => p.text).join("") || "—";

    // Streaming simple (polyfill)
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for (let i = 0; i < fullText.length; i += 40) {
            controller.enqueue(enc.encode(fullText.slice(i, i + 40)));
            await new Promise((r) => setTimeout(r, 10));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[/api/chat/stream] handler error:", err);
    return new Response("Internal error in /api/chat/stream", { status: 500 });
  }
}
