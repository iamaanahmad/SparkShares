'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, ListChecks } from 'lucide-react';
import { ApproveSubmissionButton } from './ApproveSubmissionButton';
import { toast } from 'sonner';

interface Submission {
  id: string;
  grant_id?: string;
  submitter_wallet: string;
  content: string;
  created_at: string;
}

interface MicroGrant {
  id: string;
  title: string;
  reward_amount: number;
  status: string;
  submissions: Submission[];
}

export function ViewBountiesModal({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [bounties, setBounties] = useState<MicroGrant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBounties = async () => {
    setIsLoading(true);
    try {
      // Step 1: Fetch the Bounties safely without a restrictive join
      const { data: grantsData, error: grantsErr } = await supabase
        .from('micro_grants')
        .select('id, title, reward_amount, status, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (grantsErr) throw grantsErr;
      
      const grants = (grantsData || []) as unknown as MicroGrant[];

      // Step 2: If we have bounties, fetch their submissions
      if (grants.length > 0) {
        const grantIds = grants.map(g => g.id);
        const { data: subsData, error: subsErr } = await supabase
          .from('submissions')
          .select('id, grant_id, submitter_wallet, content, created_at')
          .in('grant_id', grantIds);

        if (subsErr) {
          console.warn('Submissions fetch error (ignoring to show bounties):', subsErr);
        }

        // Map submissions back to their respective bounties
        const mappedGrants = grants.map(g => ({
          ...g,
          submissions: subsData?.filter(sub => sub.grant_id === g.id) || []
        }));

        setBounties(mappedGrants);
      } else {
        setBounties([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching bounties:', err);
      toast.error('Failed to load bounties', {
        description: err instanceof Error ? err.message : String(err)
      });
      // Always clear visually on error
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
        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium" variant="outline">
          <ListChecks size={16} className="mr-2" /> Manage Bounties
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader>
          <DialogTitle>Manage Active Bounties</DialogTitle>
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
              <div key={bounty.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                      {bounty.title}
                      {bounty.status === 'completed' && (
                        <span className="text-[10px] uppercase tracking-wide bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                          Closed
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">Reward: {bounty.reward_amount} SOL</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Submissions</h4>
                  {bounty.submissions && bounty.submissions.length > 0 ? (
                    bounty.submissions.map((sub) => (
                      <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                        <div className="overflow-hidden">
                          <p className="text-xs text-zinc-400 font-mono truncate">
                            {sub.submitter_wallet.slice(0, 6)}...{sub.submitter_wallet.slice(-4)}
                          </p>
                          <a 
                            href={sub.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 truncate"
                          >
                            <ExternalLink size={12} /> {sub.content}
                          </a>
                        </div>
                        
                        <div>
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