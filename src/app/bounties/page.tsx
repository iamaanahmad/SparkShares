'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, Coins, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { SubmitWorkModal } from '@/components/SubmitWorkModal';
import { FundBountyModal } from '@/components/FundBountyModal';

interface ProjectRow {
  $id: string;
  name: string;
  creator_wallet: string;
}

interface BountyRow {
  $id: string;
  project_id: string;
  title: string;
  description: string;
  reward_amount: number;
  status: string;
  created_at: string;
}

interface SubmissionRow {
  $id: string;
  grant_id: string;
  submitter_wallet: string;
}

interface Bounty {
  id: string;
  project_id: string;
  title: string;
  description: string;
  reward_amount: number;
  status: string;
  created_at: string;
  project_name?: string;
  creator_wallet?: string;
  submissions?: {
    submitter_wallet: string;
  }[];
}

export default function BountiesPage() {
  const { publicKey } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const [projectRes, bountyRes, submissionRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/bounties'),
          fetch('/api/submissions'),
        ]);

        const projectRows = (await projectRes.json()).rows || [] as ProjectRow[];
        const bountyRows = (await bountyRes.json()).rows || [] as BountyRow[];
        const submissionRows = (await submissionRes.json()).rows || [] as SubmissionRow[];

        const projectMap = new Map<string, ProjectRow>(projectRows.map((project: ProjectRow) => [project.$id, project]));

        const mappedBounties = bountyRows.map((bounty: BountyRow) => {
          const relatedProject = projectMap.get(bounty.project_id);
          return {
            id: bounty.$id,
            project_id: bounty.project_id,
            title: bounty.title,
            description: bounty.description,
            reward_amount: bounty.reward_amount,
            status: bounty.status,
            created_at: bounty.created_at,
            project_name: relatedProject?.name || 'Unknown Project',
            creator_wallet: relatedProject?.creator_wallet,
            submissions: submissionRows
              .filter((submission: SubmissionRow) => submission.grant_id === bounty.$id)
              .map((submission: SubmissionRow) => ({ submitter_wallet: submission.submitter_wallet })),
          } as Bounty;
        });

        setBounties(mappedBounties);
      } catch (err) {
        console.error('Error fetching bounties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-5xl mb-8">
        <Link href="/" className="text-zinc-400 hover:text-zinc-50 flex w-fit items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <header className="w-full max-w-5xl mb-12 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore Bounties</h1>
        <p className="text-zinc-400">Find open tasks, contribute your skills, and earn project tokens.</p>
      </header>

      <section className="w-full max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-zinc-500" size={48} />
          </div>
        ) : bounties.length === 0 ? (
          <div className="p-16 border border-zinc-800 bg-zinc-900/50 rounded-xl text-center">
            <p className="text-zinc-400 font-medium tracking-wide">No active bounties right now. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bounties.map((bounty) => {
              const isCompleted = bounty.status === 'completed';
              const hasSubmitted = publicKey && bounty.submissions?.some(
                (s) => s.submitter_wallet === publicKey.toBase58()
              );

              return (
                <Card key={bounty.id} className="bg-zinc-900 border-zinc-800 text-left hover:border-zinc-700 transition-colors flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                          {bounty.project_name || 'Unknown Project'}
                        </p>
                        <CardTitle className="leading-tight flex items-center gap-3">
                          {bounty.title}
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap font-normal uppercase min-w-fit tracking-wider">
                              Completed
                            </span>
                          )}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                        <Coins size={14} className="text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-bold">{bounty.reward_amount}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                      {bounty.description}
                    </p>

                    <div className="mt-auto">
                      {isCompleted ? (
                        <div className="w-full py-2 px-4 rounded-md border border-zinc-800 bg-zinc-800/50 text-zinc-500 flex items-center justify-center font-medium tracking-wide text-sm cursor-not-allowed">
                          <CheckCircle className="mr-2" size={16} /> Bounty Ended
                        </div>
                      ) : hasSubmitted ? (
                        <div className="w-full py-2 px-4 rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-medium tracking-wide text-sm cursor-default">
                          <Clock className="mr-2" size={16} /> Submitted
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <div className="flex-1">
                            <SubmitWorkModal bountyId={bounty.id} bountyTitle={bounty.title} />
                          </div>
                          <FundBountyModal
                            bountyId={bounty.id}
                            bountyTitle={bounty.title}
                            projectCreatorWallet={bounty.creator_wallet || ''}
                            currentFunded={bounty.reward_amount}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}