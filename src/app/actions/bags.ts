'use server';

import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID } from '@/lib/appwrite';

const BAGS_API_KEY = process.env.NEXT_PUBLIC_BAGS_API_KEY || 'demo-api-key';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

function getBagsSDK() {
  const connection = new Connection(SOLANA_RPC_URL);
  return new BagsSDK(BAGS_API_KEY, connection);
}

/**
 * Step 1: Create token metadata on Bags (name, symbol, description, image, socials)
 */
export async function createBagsTokenMetadata(
  name: string,
  symbol: string,
  description: string,
  imageUrl?: string,
  twitterUrl?: string,
  websiteUrl?: string
) {
  const sdk = getBagsSDK();

  const tokenInfoResponse = await sdk.tokenLaunch.createTokenInfoAndMetadata({
    name,
    symbol: symbol.toUpperCase().replace('$', ''),
    description,
    imageUrl: imageUrl || 'https://spark-shares.vercel.app/logo.png',
    twitter: twitterUrl,
    website: websiteUrl || 'https://spark-shares.vercel.app',
  });

  return tokenInfoResponse;
}

/**
 * Step 2: Create fee share configuration using Bags V2 fee-sharing
 * This sets up how trading fees are split between creator and collaborators.
 * 
 * feeClaimers: Array of { user: PublicKey (wallet), userBps: number } 
 *   - Total BPS must equal 10000 (100%)
 *   - Creator should always be included explicitly
 */
export async function createBagsFeeShareConfig(
  tokenMintAddress: string,
  creatorWalletAddress: string,
  creatorBps: number = 10000
) {
  const sdk = getBagsSDK();
  const tokenMint = new PublicKey(tokenMintAddress);
  const creatorWallet = new PublicKey(creatorWalletAddress);

  // Default: Creator gets 100% of fees (can be customized)
  const feeClaimers = [
    { user: creatorWallet, userBps: creatorBps },
  ];

  try {
    const configResult = await sdk.config.createBagsFeeShareConfig({
      payer: creatorWallet,
      baseMint: tokenMint,
      feeClaimers,
    });

    return {
      configKey: configResult.meteoraConfigKey.toBase58(),
      transactions: configResult.transactions,
      bundles: configResult.bundles,
    };
  } catch (error) {
    console.warn('Fee share config creation failed (may require mainnet):', error);
    // Return null to indicate fallback needed
    return null;
  }
}

/**
 * Step 3: Create the launch transaction using Bags SDK
 */
export async function createBagsLaunchTransaction(
  metadataUrl: string,
  tokenMintAddress: string,
  launchWalletAddress: string,
  initialBuyLamports: number,
  configKeyAddress: string
) {
  const sdk = getBagsSDK();

  const launchTx = await sdk.tokenLaunch.createLaunchTransaction({
    metadataUrl,
    tokenMint: new PublicKey(tokenMintAddress),
    launchWallet: new PublicKey(launchWalletAddress),
    initialBuyLamports,
    configKey: new PublicKey(configKeyAddress),
  });

  return launchTx;
}

/**
 * Server-side helper to update bounty reward amount in Appwrite
 */
export async function updateBountyReward(bountyId: string, additionalAmount: number) {
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
