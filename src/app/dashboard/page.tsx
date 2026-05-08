'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { CreateBountyModal } from '@/components/CreateBountyModal';
import { ViewBountiesModal } from '@/components/ViewBountiesModal';

interface Project {
  id: string;
  name: string;
  description: string;
  bags_token_mint: string;
  creator_wallet: string;
  created_at: string;
}

interface ProjectStats {
  totalBounties: number;
  totalFundsRaised: number;
  totalFundsDistributed: number;
}

const projectStatsMap = new Map<string, ProjectStats>();

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !publicKey) {
      router.push('/');
      return;
    }

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('creator_wallet', publicKey.toBase58())
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Fetch bounties for fund calculation
        if (data && data.length > 0) {
          const projectIds = data.map(p => p.id);
          const { data: bounties } = await supabase
            .from('micro_grants')
            .select('id, project_id, reward_amount, status')
            .in('project_id', projectIds);

          // Calculate stats per project
          if (bounties) {
            bounties.forEach(bounty => {
              const current = projectStatsMap.get(bounty.project_id) || {
                totalBounties: 0,
                totalFundsRaised: 0,
                totalFundsDistributed: 0
              };
              
              current.totalBounties += 1;
              current.totalFundsRaised += bounty.reward_amount || 0;
              if (bounty.status === 'completed') {
                current.totalFundsDistributed += bounty.reward_amount || 0;
              }
              
              projectStatsMap.set(bounty.project_id, current);
            });
          }
        }
        
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [connected, publicKey, router]);

  if (!connected) return null;

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
        <Link href="/" className="text-zinc-400 hover:text-zinc-50 flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <p className="text-sm text-zinc-500">
          Dashboard: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
        </p>
      </div>

      <header className="w-full max-w-5xl mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Projects</h1>
        <p className="text-zinc-400">Manage your tokenized projects and micro-grants.</p>
      </header>

      <section className="w-full max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-zinc-500" size={48} />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-16 border border-zinc-800 bg-zinc-900/50 rounded-xl text-center">
            <p className="text-zinc-400 font-medium mb-4">No projects launched yet.</p>
            <Link href="/">
              <Button>Launch Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stats = projectStatsMap.get(project.id) || {
                totalBounties: 0,
                totalFundsRaised: 0,
                totalFundsDistributed: 0
              };

              return (
              <Card key={project.id} className="bg-zinc-900 border-zinc-800 text-left hover:border-zinc-700 transition-colors flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
                  <CardDescription className="text-zinc-400 truncate" title={project.description}>
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="text-xs bg-zinc-950 p-2 rounded-md border border-zinc-800 break-all font-mono text-zinc-500">
                    Bags Mint: {project.bags_token_mint || 'Pending...'}
                  </div>

                  {/* Fund Tracking Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-zinc-950 rounded-md border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bounties</p>
                      <p className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                        <Zap size={14} /> {stats.totalBounties}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-md border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Raised</p>
                      <p className="text-lg font-bold text-fuchsia-400">{stats.totalFundsRaised.toFixed(1)} SOL</p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-md border border-zinc-800 col-span-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Distributed</p>
                      <p className="text-lg font-bold text-emerald-400">{stats.totalFundsDistributed.toFixed(1)} SOL</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-col sm:flex-row w-full gap-3 mt-auto">
                    <div className="flex-1">
                      <CreateBountyModal projectId={project.id} projectName={project.name} />
                    </div>
                    <div className="flex-1">
                      <ViewBountiesModal projectId={project.id} projectName={project.name} />
                    </div>
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