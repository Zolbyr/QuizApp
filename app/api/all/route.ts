import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const quizzes = await prisma.quiz.findMany({
    include: {
      questions: true,
    }
  })

  return new Response(JSON.stringify(quizzes), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}