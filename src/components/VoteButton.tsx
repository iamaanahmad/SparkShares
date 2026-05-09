'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { castVote } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoteButtonProps {
  submissionId: string;
  grantId: string;
  currentVotes: number;
  hasAlreadyVoted: boolean;
  onVoteSuccess?: () => void;
}

export function VoteButton({
  submissionId,
  grantId,
  currentVotes,
  hasAlreadyVoted,
  onVoteSuccess,
}: VoteButtonProps) {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [voted, setVoted] = useState(hasAlreadyVoted);
  const [voteCount, setVoteCount] = useState(currentVotes);

  const handleVote = async () => {
    if (!publicKey || !connected) {
      toast.warning('Connect Wallet', {
        description: 'Connect your Solana wallet to vote.',
      });
      return;
    }

    if (voted) {
      toast.info('Already Voted', {
        description: 'You have already voted on this bounty.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await castVote({
        submission_id: submissionId,
        grant_id: grantId,
        voter_wallet: publicKey.toBase58(),
      });

      setVoted(true);
      setVoteCount((prev) => prev + 1);
      toast.success('Vote Cast!', {
        description: 'Your vote has been recorded.',
      });
      if (onVoteSuccess) onVoteSuccess();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Vote Failed', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVote}
      disabled={isLoading || voted || !connected}
      size="sm"
      className={`h-8 text-xs font-bold transition-all ${
        voted
          ? 'bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 cursor-default'
          : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <ThumbsUp className={`w-3 h-3 mr-1 ${voted ? 'fill-fuchsia-400' : ''}`} />
      )}
      {voteCount} {voted ? 'Voted' : 'Vote'}
    </Button>
  );
}
