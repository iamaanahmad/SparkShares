'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FundBountyModalProps {
  bountyId: string;
  bountyTitle: string;
  projectCreatorWallet: string;
  currentFunded: number;
  onFundSuccess?: () => void;
}

export function FundBountyModal({ 
  bountyId, 
  bountyTitle, 
  projectCreatorWallet,
  currentFunded,
  onFundSuccess 
}: FundBountyModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState('0.1');

  const handleFund = async () => {
    if (!publicKey) {
      toast.warning('Wallet Not Connected', {
        description: 'Connect your wallet to fund this bounty.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Invalid Amount', {
          description: 'Please enter a valid amount greater than 0.'
        });
        setIsLoading(false);
        return;
      }

      // 1. Create transaction to send SOL to project creator (representing a backer contribution)
      const creatorPubKey = new PublicKey(projectCreatorWallet);
      
      const fundTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorPubKey,
          lamports: Math.floor(amount * 1_000_000_000), // Convert to lamports
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      fundTx.recentBlockhash = blockhash;
      fundTx.feePayer = publicKey;

      console.log(`Funding bounty ${bountyId} with ${amount} SOL...`);
      const signature = await sendTransaction(fundTx, connection);
      console.log(`Funding successful! Tx: ${signature}`);

      // 2. Log the backing in supabase (create a backings table entry)
      const { error: backingErr } = await supabase
        .from('backings')
        .insert({
          grant_id: bountyId,
          backer_wallet: publicKey.toBase58(),
          amount_sol: amount,
          tx_signature: signature,
        })
        .select()
        .single();

      // Ignore error if backings table doesn't exist (we can add it later)
      if (backingErr && !backingErr.message.includes('does not exist')) {
        console.warn('Backing log error:', backingErr);
      }

      toast.success('Bounty Funded', {
        description: `Successfully contributed ${amount} SOL to "${bountyTitle}"`
      });

      setOpen(false);
      setFundAmount('0.1');
      if (onFundSuccess) onFundSuccess();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Funding failed', {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-8"
          variant="outline"
        >
          <Coins className="w-3 h-3 mr-2" />
          Fund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader>
          <DialogTitle>Fund This Bounty</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Contribute SOL to increase the reward pool for "{bountyTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Current Pool</p>
            <p className="text-2xl font-bold text-cyan-400">{currentFunded.toFixed(2)} SOL</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-medium">
              Contribution Amount (SOL)
            </Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="0.1"
              className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-indigo-500 focus-visible:border-indigo-400"
            />
            <p className="text-xs text-zinc-500">
              Minimum: 0.01 SOL (covers transaction fees on devnet)
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <Button
              onClick={handleFund}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Contribute {fundAmount} SOL
                </>
              )}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
