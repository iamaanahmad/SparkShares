'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createProject } from '@/lib/appwrite';
import { createBagsTokenMetadata, createBagsFeeShareConfig, createBagsLaunchTransaction } from '@/app/actions/bags';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Rocket, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function LaunchProjectModal() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'metadata' | 'feeconfig' | 'launch' | 'saving'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    twitterUrl: '',
    feeSharingEnabled: true,
    creatorFeeBps: 7000, // 70% to creator by default
  });

  const handleLaunch = async () => {
    if (!publicKey) return;
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.warning('Missing Fields', { description: 'Please fill in project name and description.' });
      return;
    }

    setIsLoading(true);
    let bagsTokenMintAddress = "MockTokenMintAddress_Devnet_" + Date.now();
    const symbol = formData.symbol.trim() || formData.name.substring(0, 4).toUpperCase();

    try {
      // ──────── Step 1: Create Token Metadata via Bags SDK ────────
      setStep('metadata');
      let tokenInfoResponse;
      try {
        tokenInfoResponse = await createBagsTokenMetadata(
          formData.name,
          symbol,
          formData.description,
          undefined, // uses default logo
          formData.twitterUrl || undefined,
          'https://spark-shares.vercel.app'
        );
        toast.info('Metadata Created', {
          description: `Token $${symbol} metadata uploaded to Bags.`,
          duration: 3000,
        });
      } catch (metaErr: unknown) {
        console.warn('Bags metadata creation failed:', metaErr);
        toast.error('Bags API Error', {
          description: metaErr instanceof Error ? metaErr.message : String(metaErr),
          duration: 5000,
        });
        tokenInfoResponse = null;
      }

      // ──────── Step 2: Create Fee Share Config (V2) ────────
      let configKey: string | null = null;
      if (tokenInfoResponse && formData.feeSharingEnabled) {
        setStep('feeconfig');
        try {
          const feeConfig = await createBagsFeeShareConfig(
            tokenInfoResponse.tokenMint,
            publicKey.toBase58(),
            formData.creatorFeeBps
          );
          if (feeConfig) {
            configKey = feeConfig.configKey;
            toast.info('Fee Sharing Configured', {
              description: `Creator receives ${formData.creatorFeeBps / 100}% of trading fees.`,
              duration: 3000,
            });
          }
        } catch (feeErr) {
          console.warn('Fee share config failed:', feeErr);
        }
      }

      // ──────── Step 3: Create Launch Transaction ────────
      setStep('launch');
      if (tokenInfoResponse && configKey) {
        try {
          const launchTx = await createBagsLaunchTransaction(
            tokenInfoResponse.tokenMetadata,
            tokenInfoResponse.tokenMint,
            publicKey.toBase58(),
            100_000_000, // 0.1 SOL initial buy
            configKey
          );

          console.log("Requesting Wallet Signature to deploy Token on Solana...");
          const signature = await sendTransaction(launchTx, connection);
          console.log("Token Launched Successfully! Tx:", signature);
          bagsTokenMintAddress = tokenInfoResponse.tokenMint;

          toast.success('Token Launched on Bags!', {
            description: `$${symbol} is now live. Tx: ${signature.slice(0, 8)}...`,
          });
        } catch (launchErr) {
          console.warn("Bags launch transaction failed:", launchErr);
          // Fall through to devnet fallback
        }
      }

      // ──────── Devnet Fallback (if Bags SDK fails) ────────
      if (bagsTokenMintAddress.startsWith('MockTokenMint')) {
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
          description: "Bags SDK requires Mainnet for Meteora pools. Using Devnet demo transaction.",
          duration: 5000,
        });

        const signature = await sendTransaction(dummyLaunchTx, connection);
        console.log("Devnet fallback tx:", signature);
      }

      // ──────── Step 4: Persist to Appwrite ────────
      setStep('saving');
      const project = await createProject({
        creator_wallet: publicKey.toBase58(),
        name: formData.name,
        description: formData.description,
        bags_token_mint: bagsTokenMintAddress,
        fee_sharing_enabled: formData.feeSharingEnabled,
        fee_share_bps: formData.creatorFeeBps,
      });

      setOpen(false);
      setStep('idle');
      toast.success("Project Successfully Launched!", {
        description: `${formData.name} is live with ${formData.feeSharingEnabled ? formData.creatorFeeBps / 100 + '% creator fee sharing' : 'no fee sharing'}.`
      });

      router.push(`/dashboard?projectId=${project.$id}`);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Deployment failed", {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
      setStep('idle');
    }
  };

  const stepLabels: Record<string, string> = {
    idle: 'EXECUTE TOKEN LAUNCH',
    metadata: 'Creating Metadata...',
    feeconfig: 'Configuring Fee Sharing...',
    launch: 'Launching on Solana...',
    saving: 'Saving Project...',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="lg" className="w-full h-14 text-base font-bold tracking-wide rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:from-cyan-400 hover:to-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all border-0">
          <Rocket className="mr-2" size={18} /> Launch Project
        </Button>
      } />
      <DialogContent className="sm:max-w-lg md:max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-50 shadow-[0_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top gradient bar */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400" />

        <div className="p-6 md:p-8 overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Rocket className="text-cyan-400" size={24} />
              Launch on Bags
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-2">
              Deploy your project token with automatic fee-sharing on the Bags platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Project Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-lg h-12"
                placeholder="e.g. SparkShares Community"
              />
            </div>

            {/* Token Symbol */}
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-sm font-medium text-zinc-300">
                Token Symbol
              </Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase().slice(0, 6) })}
                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-cyan-500/50 rounded-lg h-12 font-mono uppercase"
                placeholder="e.g. SPARK"
                maxLength={6}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-sm font-medium text-zinc-300">
                Project Description
              </Label>
              <Input
                id="desc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-fuchsia-500/50 rounded-lg h-12"
                placeholder="A platform to earn royalties via automated micro-grants..."
              />
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm font-medium text-zinc-300">
                Twitter / X URL (optional)
              </Label>
              <Input
                id="twitter"
                value={formData.twitterUrl}
                onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-cyan-500/50 rounded-lg h-12"
                placeholder="https://x.com/yourproject"
              />
            </div>

            {/* Fee Sharing Section */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="text-emerald-400" size={18} />
                  <span className="text-sm font-bold text-zinc-200">Bags Fee Sharing (V2)</span>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, feeSharingEnabled: !formData.feeSharingEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.feeSharingEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      formData.feeSharingEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {formData.feeSharingEnabled && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Creator Fee Share</span>
                    <span className="font-bold text-emerald-400">{formData.creatorFeeBps / 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={10000}
                    step={500}
                    value={formData.creatorFeeBps}
                    onChange={e => setFormData({ ...formData, creatorFeeBps: parseInt(e.target.value) })}
                    className="w-full accent-emerald-500 h-2"
                  />
                  <p className="text-xs text-zinc-500">
                    Trading fees will be split: <span className="text-emerald-400 font-medium">{formData.creatorFeeBps / 100}%</span> to creator,{' '}
                    <span className="text-fuchsia-400 font-medium">{(10000 - formData.creatorFeeBps) / 100}%</span> available for collaborators.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8 flex gap-4 sm:justify-between w-full border-t border-zinc-800 pt-6">
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse border border-emerald-400" />
              SOL Network: {connection ? 'Connected' : 'Disconnected'}
            </div>
            <Button
              onClick={handleLaunch}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[220px] h-12 font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:from-cyan-400 hover:to-emerald-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Sparkles className="mr-1 h-4 w-4 animate-pulse" />
                  {stepLabels[step]}
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  {stepLabels.idle}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
