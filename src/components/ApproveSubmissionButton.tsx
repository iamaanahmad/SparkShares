'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ApproveSubmissionButton({ 
  submissionId, 
  bountyId, 
  submitterWallet,
  rewardAmount,
  onComplete
}: { 
  submissionId: string;
  bountyId: string;
  submitterWallet: string;
  rewardAmount: number;
  onComplete?: () => void;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!publicKey) {
      toast.warning('Wallet Not Connected', {
        description: 'Connect your wallet to approve this submission.'
      });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Build SOL Payout Transaction
      // In a real MVP, we'd send the actual token or USDC. For the hackathon devnet demo, 
      // we'll send dummy SOL equal to rewardAmount directly to the contributor!
      const payeePubKey = new PublicKey(submitterWallet);
      
      const payoutTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: payeePubKey,
          lamports: Math.floor(rewardAmount * 1_000_000_000), // Converted to lamports
        })
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      payoutTx.recentBlockhash = blockhash;
      payoutTx.feePayer = publicKey;

      console.log(`Approving submission ${submissionId}. Requesting payout signature...`);
      const signature = await sendTransaction(payoutTx, connection);
      console.log(`Payout successful! Tx: ${signature}`);

      // 2. Mark the bounty as completed so no one else submits
      const { error: grantErr } = await supabase
        .from('micro_grants')
        .update({ status: 'completed' })
        .eq('id', bountyId);
      if (grantErr) throw grantErr;

      toast.success('Bounty Paid', {
        description: `Successfully sent ${rewardAmount} SOL to ${submitterWallet.slice(0,6)}...${submitterWallet.slice(-4)}`
      });
      if (onComplete) onComplete();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Payout failed', {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleApprove} 
      disabled={isLoading}
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8"
    >
      {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-2" />}
      Pay {rewardAmount} SOL
    </Button>
  );
}