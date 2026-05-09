'use server';

import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID } from '@/lib/appwrite';

export async function createBagsTokenMetadata(name: string, symbol: string, description: string) {
  // Always perform this on the server where Node JS form-data is available
  const connection = new Connection("https://api.devnet.solana.com");
  const bagsClient = new BagsSDK(
    process.env.NEXT_PUBLIC_BAGS_API_KEY || 'demo-api-key',
    connection
  );

  const tokenInfoResponse = await bagsClient.tokenLaunch.createTokenInfoAndMetadata({
    name,
    symbol,
    description,
    imageUrl: 'https://bags.fm/logo.png', // Or update with a real image link
  });

  return tokenInfoResponse;
}

export async function createBagsLaunchTransaction(
  metadataUrl: string,
  tokenMintAddress: string,
  launchWalletAddress: string,
  initialBuyLamports: number,
  configKeyAddress: string
) {
  // Server-side SDK call avoids CORS issues
  const connection = new Connection("https://api.devnet.solana.com");
  const bagsClient = new BagsSDK(
    process.env.NEXT_PUBLIC_BAGS_API_KEY || 'demo-api-key',
    connection
  );

  const launchTx = await bagsClient.tokenLaunch.createLaunchTransaction({
    metadataUrl,
    tokenMint: new PublicKey(tokenMintAddress),
    launchWallet: new PublicKey(launchWalletAddress),
    initialBuyLamports,
    configKey: new PublicKey(configKeyAddress),
  });

  return launchTx;
}

export async function updateBountyReward(bountyId: string, additionalAmount: number) {
  // Server-side update to Appwrite to increase bounty reward amount
  try {
    // First fetch the current bounty to get its current reward_amount
    const getResponse = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DATABASE_ID}/tables/micro_grants/rows/${bountyId}`,
      {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch bounty: ${getResponse.status}`);
    }

    const currentBounty = (await getResponse.json()) as { reward_amount: number; [key: string]: unknown };
    const newRewardAmount = (currentBounty.reward_amount || 0) + additionalAmount;

    // Then update it with the new amount
    const updateResponse = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DATABASE_ID}/tables/micro_grants/rows/${bountyId}`,
      {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': APPWRITE_PROJECT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reward_amount: newRewardAmount }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update bounty: ${updateResponse.status}`);
    }

    return { success: true, newRewardAmount };
  } catch (error) {
    console.error('Error updating bounty reward:', error);
    throw error;
  }
}
