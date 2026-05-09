'use server';

import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

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
