import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { NextRequest, NextResponse } from 'next/server';

interface AppwriteProjectRow {
  creator_wallet: string;
  [key: string]: unknown;
}

interface AppwriteProjectsResponse {
  rows: AppwriteProjectRow[];
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const creatorWallet = searchParams.get('creator_wallet');
  
  if (!creatorWallet) {
    return NextResponse.json({ error: 'creator_wallet required' }, { status: 400 });
  }

  try {
    // Call Appwrite directly from server (no CORS issues, uses API key)
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/tables/projects/rows`,
      {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
          'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Appwrite error: ${response.status}`);
    }

    const data = (await response.json()) as AppwriteProjectsResponse;
    
    // Filter rows client-side by creator_wallet
    const filteredRows = data.rows.filter((row) => row.creator_wallet === creatorWallet);

    return NextResponse.json({ rows: filteredRows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
