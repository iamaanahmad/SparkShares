import { NextResponse } from 'next/server';
import { listVotes } from '@/lib/appwrite';

export async function GET() {
  try {
    const rows = await listVotes();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ rows: [] });
  }
}
