import { APPWRITE_DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

interface AppwriteSubmissionRow {
  $id: string;
  grant_id: string;
  submitter_wallet: string;
  content: string;
  created_at: string;
  [key: string]: unknown;
}

interface AppwriteSubmissionsResponse {
  rows: AppwriteSubmissionRow[];
}

export async function GET() {
  try {
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DATABASE_ID}/tables/submissions/rows?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D`,
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

    const data = (await response.json()) as AppwriteSubmissionsResponse;
    return NextResponse.json({ rows: data.rows });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
