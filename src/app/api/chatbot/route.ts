import { consultarIncidente }
from "@/ai/rag";

export async function POST(req: Request) {

  const { pregunta } =
    await req.json();

  const respuesta =
    await consultarIncidente(pregunta);

  return Response.json({
    respuesta
  });
}