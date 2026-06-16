import { initializeApp } from '@/lib/ai/initializer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await initializeApp();
    return NextResponse.json({ message: 'Bootstrap complete.' }, { status: 200 });
  } catch (error) {
    console.error('[API BOOTSTRAP] Error:', error);
    return NextResponse.json({ message: 'Error during bootstrap.' }, { status: 500 });
  }
}
