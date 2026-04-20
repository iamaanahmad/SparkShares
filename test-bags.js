const { BagsSDK } = require('@bagsfm/bags-sdk');
const { Connection, PublicKey } = require('@solana/web3.js');
const sdk = new BagsSDK('demo-api-key', new Connection('https://api.devnet.solana.com'));
const pk = new PublicKey('BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv');
sdk.tokenLaunch.createLaunchTransaction({
  metadataUrl: 'https://bafkreihq5oexmt7a4tzx53uymquwcvh2eplsvh36i5y6wzpxm2m6yoz2ta.ipfs.nftstorage.link/',
  tokenMint: pk,
  launchWallet: pk,
  initialBuyLamports: 10000000,
  configKey: pk
}).then(console.log).catch(console.error);
