import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const history = await prisma.pasteCheck.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    })
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'Error fetching history' }, { status: 500 })
  }
}