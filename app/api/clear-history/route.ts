// app/api/clear-history/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Delete all records from the PasteCheck table
    await prisma.pasteCheck.deleteMany({})
    
    return NextResponse.json({ message: 'History cleared successfully' })
  } catch (error) {
    console.error('Error clearing history:', error)
    return NextResponse.json(
      { error: 'Error clearing history' }, 
      { status: 500 }
    )
  }
}