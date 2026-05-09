'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, ListChecks, Vote, ThumbsUp } from 'lucide-react';
import { ApproveSubmissionButton } from './ApproveSubmissionButton';
import { VoteButton } from './VoteButton';
import { toast } from 'sonner';
import { listBountiesByProject, listSubmissions, listVotes } from '@/lib/appwrite';

interface Submission {
  id: string;
  grant_id?: string;
  submitter_wallet: string;
  content: string;
  created_at: string;
  voteCount: number;
  hasVoted: boolean;
}

interface MicroGrant {
  id: string;
  title: string;
  reward_amount: number;
  status: string;
  voting_enabled: boolean;
  submissions: Submission[];
}

export function ViewBountiesModal({ projectId, projectName }: { projectId: string; projectName: string }) {
  const { publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [bounties, setBounties] = useState<MicroGrant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBounties = async () => {
    setIsLoading(true);
    try {
      const [grants, subsData, votesData] = await Promise.all([
        listBountiesByProject(projectId),
        listSubmissions(),
        listVotes(),
      ]);

      setBounties(
        grants.map((grant) => ({
          id: grant.$id,
          title: grant.title,
          reward_amount: grant.reward_amount,
          status: grant.status,
          voting_enabled: grant.voting_enabled ?? false,
          submissions: subsData
            .filter((sub) => sub.grant_id === grant.$id)
            .map((sub) => {
              const subVotes = votesData.filter((v) => v.submission_id === sub.$id);
              return {
                id: sub.$id,
                grant_id: sub.grant_id,
                submitter_wallet: sub.submitter_wallet,
                content: sub.content,
                created_at: sub.created_at,
                voteCount: subVotes.length,
                hasVoted: publicKey
                  ? subVotes.some((v) => v.voter_wallet === publicKey.toBase58())
                  : false,
              };
            })
            // Sort by vote count (highest first) for voting-enabled bounties
            .sort((a, b) => b.voteCount - a.voteCount),
        }))
      );
    } catch (err: unknown) {
      console.error('Error fetching bounties:', err);
      toast.error('Failed to load bounties', {
        description: err instanceof Error ? err.message : String(err)
      });
      setBounties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBounties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg" variant="outline">
          <ListChecks size={16} className="mr-2" /> Manage Bounties
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-50 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Active Bounties</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Review submissions and payout micro-grants for {projectName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-zinc-500" />
            </div>
          ) : bounties.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">No bounties created yet.</p>
          ) : (
            bounties.map((bounty) => (
              <div key={bounty.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-zinc-100 flex items-center gap-2 flex-wrap">
                      {bounty.title}
                      {bounty.status === 'completed' && (
                        <span className="text-[10px] uppercase tracking-wide bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                          Closed
                        </span>
                      )}
                      {bounty.voting_enabled && (
                        <span className="text-[10px] uppercase tracking-wide bg-fuchsia-900/50 text-fuchsia-400 px-2 py-0.5 rounded-full border border-fuchsia-800 flex items-center gap-1">
                          <Vote size={10} /> Community Vote
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">Reward: {bounty.reward_amount} SOL</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    Submissions
                    {bounty.voting_enabled && (
                      <span className="text-fuchsia-400 flex items-center gap-1 normal-case tracking-normal font-normal">
                        <ThumbsUp size={10} /> sorted by votes
                      </span>
                    )}
                  </h4>
                  {bounty.submissions && bounty.submissions.length > 0 ? (
                    bounty.submissions.map((sub, idx) => (
                      <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center gap-2">
                            {bounty.voting_enabled && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                idx === 0 && sub.voteCount > 0
                                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                #{idx + 1}
                              </span>
                            )}
                            <p className="text-xs text-zinc-400 font-mono truncate">
                              {sub.submitter_wallet.slice(0, 6)}...{sub.submitter_wallet.slice(-4)}
                            </p>
                          </div>
                          <a
                            href={sub.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 truncate"
                          >
                            <ExternalLink size={12} /> {sub.content}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Voting Button */}
                          {bounty.voting_enabled && bounty.status !== 'completed' && (
                            <VoteButton
                              submissionId={sub.id}
                              grantId={bounty.id}
                              currentVotes={sub.voteCount}
                              hasAlreadyVoted={sub.hasVoted}
                              onVoteSuccess={fetchBounties}
                            />
                          )}

                          {/* Approve & Pay Button */}
                          {bounty.status === 'completed' ? (
                            <span className="text-xs text-zinc-600">Bounty closed</span>
                          ) : (
                            <ApproveSubmissionButton
                              submissionId={sub.id}
                              bountyId={bounty.id}
                              submitterWallet={sub.submitter_wallet}
                              rewardAmount={bounty.reward_amount}
                              onComplete={fetchBounties}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No submissions yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}