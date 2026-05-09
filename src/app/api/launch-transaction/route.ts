import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const response = await fetch(
      'https://api.bags.fm/v1/token/launch/transaction',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BAGS_API_KEY || ''}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating launch transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create launch transaction' },
      { status: 500 }
    );
  }
}
