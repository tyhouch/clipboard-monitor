// src/app/api/check-content/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a content safety checker. Analyze the following text and respond with 'SAFE' if it contains no sensitive company information, or 'SENSITIVE' if it appears to contain internal company data, credentials, or confidential information. Only respond with one of these two words." },
        { role: "user", content }
      ],
      temperature: 0,
      max_tokens: 1
    });

    const isSafe = completion.choices[0].message.content === 'SAFE'

    // Store in database
    await prisma.pasteCheck.create({
      data: {
        contentPreview: content.substring(0, 100) + '...',
        isSafe
      }
    })

    return NextResponse.json({ safe: isSafe })
  } catch (error) {
    console.error('Error checking content:', error)
    return NextResponse.json({ error: 'Error checking content' }, { status: 500 })
  }
}