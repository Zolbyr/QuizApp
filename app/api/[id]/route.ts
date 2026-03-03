import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";

export async function GET(_request: Request, ctx: RouteContext<'/api/[id]'>) {
  const { userId } = await auth();

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await ctx.params

  const quiz = await prisma.quiz.findFirst({
    where: { id },
    include: {
      questions: true,
    }
  })

  return new Response(JSON.stringify(quiz), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}