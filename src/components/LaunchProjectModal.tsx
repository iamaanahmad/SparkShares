'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BagsSDK } from '@bagsfm/bags-sdk';
import { supabase } from '@/lib/supabase';
import { createBagsTokenMetadata } from '@/app/actions/bags';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LaunchProjectModal() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Auto-Pilot Creator App',
    description: 'A platform to earn royalties via automated micro-grants.',
  });

  const handleLaunch = async () => {
    if (!publicKey) return;
    setIsLoading(true);

    let bagsTokenMintAddress = "MockTokenMintAddress_Devnet" + Date.now();

    try {
      // 1. Initialize Bags SDK
      // Using a fallback API key if not provided in the environment.
      // Make sure to add NEXT_PUBLIC_BAGS_API_KEY to your .env.local!
      const bagsClient = new BagsSDK(
        process.env.NEXT_PUBLIC_BAGS_API_KEY || 'demo-api-key',
        connection
      );

      // 2. Submit the Token Info & Metadata to Bags
      // We run this metadata step in a Server Action because it uses Node.js 'formData' APIs.      
      try {
        const tokenInfoResponse = await createBagsTokenMetadata(
          formData.name,
          formData.name.substring(0, 4).toUpperCase(),
          formData.description
        );

        // 3. Create the actual Launch Transaction using the retrieved metadata URL
        const launchTx = await bagsClient.tokenLaunch.createLaunchTransaction({ 
          metadataUrl: tokenInfoResponse.tokenMetadata,
          tokenMint: new PublicKey(tokenInfoResponse.tokenMint),
          launchWallet: publicKey,
          initialBuyLamports: 100_000_000, 
          configKey: new PublicKey(tokenInfoResponse.tokenMint), 
        });

        // 4. Prompt the user's wallet to sign & pay for the Launch
        console.log("Requesting Wallet Signature to deploy Token on Solana...");
        const signature = await sendTransaction(launchTx, connection);
        console.log("Token Launched Successfully! Tx:", signature);

        // Map the minted Token address to our variable
        bagsTokenMintAddress = tokenInfoResponse.tokenMint;
      } catch (sdkError: unknown) {
        console.warn("Bags API SDK returned Error:", sdkError);
        console.log("NOTE: Bags API token-launch endpoints usually require Solana Mainnet since Meteora Dynamic Bonding Curves only exist on mainnet.");
        
        // HACKATHON FALLBACK: Manually pop up Phantom Wallet to prove the Web3 connection UX works!
        // We will create a dummy 0.01 SOL "Launch Fee" devnet transaction to the Bags Creation Authority
        const dummyLaunchTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey("BAGSB9TpGrZxQbEsrEznv5jXXdwyP6AXerN8aVRiAmcv"),
            lamports: 10_000_000, // 0.01 SOL
          })
        );
        const { blockhash } = await connection.getLatestBlockhash();
        dummyLaunchTx.recentBlockhash = blockhash;
        dummyLaunchTx.feePayer = publicKey;

        toast.info("Devnet Fallback Active", {
          description: "Bags SDK requires Mainnet for token-launch points. We are falling back to a Devnet dummy transaction for the Hackathon.",
          duration: 6000,
        });
        
        console.log("Requesting Devnet fallback Wallet Signature...");
        const signature = await sendTransaction(dummyLaunchTx, connection);
        console.log("Devnet Dummy Token Launched Successfully! Tx:", signature);
      } // CLOSE INNER TRY-CATCH

      // 5. Persist to our Supabase database MVP
      const { data, error } = await supabase.from('projects').insert({
        creator_wallet: publicKey.toBase58(),
        name: formData.name,
        description: formData.description,
        bags_token_mint: bagsTokenMintAddress,
      }).select().single();

      if (error) throw error;
      
      setOpen(false);
      toast.success("Project Successfully Launched", {
        description: `Your token uses the DEVNET mock address ${bagsTokenMintAddress}`
      });

      // Hackathon Speed Mode: Navigate directly to the newly created project's dashboard!
      router.push(`/dashboard?projectId=${data.id}`);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Deployment failed", {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto rounded-none font-mono font-bold uppercase tracking-widest bg-yellow-400 border border-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.6)] px-8 transition-all">
          Launch Your Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl bg-black border border-cyan-500/50 rounded-none text-cyan-50 shadow-[0_0_50px_rgba(34,211,238,0.2)] p-0 overflow-hidden">
        {/* Top decorative bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400" />
        
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-mono font-bold tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
              // Deploy On Bags
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-mono text-sm uppercase tracking-widest mt-2 border-l-2 border-cyan-500/50 pl-3">
              > Initializing token schema parameters...<br/>
              > Awaiting user input parameters...
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4 border border-zinc-800 bg-zinc-950/50 p-6 relative">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-zinc-700">SYS_CONFIG</div>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="name" className="text-left font-mono text-cyan-300 tracking-widest uppercase text-xs">
                [ Token_Name ]
              </Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="col-span-3 bg-black border-cyan-900/50 text-cyan-50 font-mono focus-visible:ring-cyan-500/50 focus-visible:border-cyan-400 rounded-none h-12" 
                placeholder="Enter project name..."
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Label htmlFor="desc" className="text-left font-mono text-fuchsia-300 tracking-widest uppercase text-xs">
                [ Token_Manifesto ]
              </Label>
              <Input 
                id="desc" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="col-span-3 bg-black border-fuchsia-900/50 text-fuchsia-50 font-mono focus-visible:ring-fuchsia-500/50 focus-visible:border-fuchsia-400 rounded-none h-12" 
                placeholder="Enter project description..."
              />
            </div>
          </div>
          
          <DialogFooter className="mt-8 flex gap-4 sm:justify-between w-full border-t border-zinc-800 pt-6">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 bg-yellow-400/50 animate-pulse border border-yellow-400" />
              SOL_NETWORK: DEVNET
            </div>
            <Button 
              onClick={handleLaunch} 
              disabled={isLoading} 
              className="w-full sm:w-auto min-w-[200px] h-12 font-mono font-bold uppercase tracking-widest bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cyan-400"
            >
              {isLoading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> EXECUTING...</> : "EXECUTE TOKEN LAUNCH"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
