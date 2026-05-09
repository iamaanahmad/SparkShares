import { APPWRITE_DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

interface AppwriteProjectRow {
  $id: string;
  name: string;
  description: string;
  bags_token_mint?: string;
  creator_wallet: string;
  created_at: string;
  [key: string]: unknown;
}

interface AppwriteProjectsResponse {
  rows: AppwriteProjectRow[];
}

export async function GET() {
  try {
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DATABASE_ID}/tables/projects/rows?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D`,
      {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Appwrite error: ${response.status}`);
    }

    const data = (await response.json()) as AppwriteProjectsResponse;
    return NextResponse.json({ rows: data.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
