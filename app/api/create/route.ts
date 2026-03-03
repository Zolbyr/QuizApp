import { auth } from '@clerk/nextjs/server'
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;

const gemini = new GoogleGenAI({ apiKey });

const model = "gemini-2.5-flash";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const data = await request.json();

  const { title, content } = data;

  const response = await generateSummary(content);

  if (!response) return new Response('Failed to generate summary', { status: 500 });

  const { summary, questions } = response;

  const quiz = await prisma.quiz.create({
    data: {
      userId,
      title,
      content,
      summary,
    }
  })

  await prisma.question.createMany({
    data: questions.map(q => ({
      quizId: quiz.id,
      question: q.question,
      answers: q.options,
      correct: q.options[q.correctIndex],
    }))
  })

  const fullQuiz = await prisma.quiz.findFirst({
    where: { id: quiz.id },
    include: {
      questions: true,
    }
  })

  return new Response(JSON.stringify(fullQuiz), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const prompt = `
You create study materials from the provided content.

Return ONLY valid JSON (no markdown, no extra text) that matches this TypeScript shape:
{
  "summary": string,
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": 0|1|2|3
    }
  ]
}

Rules:
- summary: 4-8 sentences, clear and faithful to the content.
- quiz: exactly 5 questions.
- Each question must be answerable using ONLY the given content.
- Options must be plausible; exactly one correct option per question.
- Do not include explanations.
- Avoid trick questions.
`
type GeminiResponse = {
  summary: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

async function generateSummary(contents: string): Promise<GeminiResponse | null> {
  const response = await gemini.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: prompt,
    },
  });

  if (!response.candidates) return null;

  if (!response.candidates[0].content) return null;

  if (!response.candidates[0].content.parts) return null;

  if (!response.candidates[0].content.parts[0].text) return null;

  return JSON.parse(response.candidates[0].content.parts[0].text.replace("```json", "").replace("```", "").trim());
}