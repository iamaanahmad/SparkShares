import { APPWRITE_DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

interface AppwriteBountyRow {
  project_id: string;
  reward_amount?: number;
  status?: string;
  [key: string]: unknown;
}

interface AppwriteBountiesResponse {
  rows: AppwriteBountyRow[];
}

export async function GET() {
  try {
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DATABASE_ID}/tables/micro_grants/rows?queries%5B0%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22created_at%22%7D`,
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

    const data = (await response.json()) as AppwriteBountiesResponse;
    return NextResponse.json({ rows: data.rows });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
  }
}
