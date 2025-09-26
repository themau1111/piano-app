/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatRequest } from "@/lib/chat/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("hola");
    const body = (await req.json()) as ChatRequest;
    if (!body?.messages?.length) {
      return Response.json({ error: "Faltan mensajes" }, { status: 400 });
    }
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: "Error en chat" }, { status: 500 });
  }
}
