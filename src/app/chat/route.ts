import { ChatRequest, ChatResponse } from "@/lib/chat/types";
import { generateChatCompletion } from "@/lib/llm/generate";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    if (!body?.messages?.length) {
      return Response.json({ error: "Faltan mensajes" }, { status: 400 });
    }
    const text = await generateChatCompletion(body);
    const payload: ChatResponse = { text };
    return Response.json(payload);
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: "Error en chat" }, { status: 500 });
  }
}
