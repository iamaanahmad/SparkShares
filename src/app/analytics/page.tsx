'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp, Users, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import { listBounties, listProjects, listSubmissions } from '@/lib/appwrite';

interface ProjectStats {
  projectId: string;
  projectName: string;
  totalFundsRaised: number;
  totalFundsDistributed: number;
  bountyCount: number;
  submissionCount: number;
  completedBounties: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalProjects: 0,
    totalBounties: 0,
    totalSubmissions: 0,
    totalDistributed: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [projects, bounties, submissions] = await Promise.all([
          listProjects(),
          listBounties(),
          listSubmissions(),
        ]);

        // Calculate stats per project
        const projectStats: ProjectStats[] = projects.map(project => {
          const projectBounties = bounties.filter((bounty) => bounty.project_id === project.$id);
          const projectSubmissions = submissions.filter((submission) =>
            projectBounties.some((bounty) => bounty.$id === submission.grant_id)
          );
          const completedBounties = projectBounties.filter((bounty) => bounty.status === 'completed');

          const totalDistributed = completedBounties.reduce((sum, bounty) => sum + (bounty.reward_amount || 0), 0);

          return {
            projectId: project.$id,
            projectName: project.name,
            totalFundsRaised: projectBounties.reduce((sum, bounty) => sum + (bounty.reward_amount || 0), 0),
            totalFundsDistributed: totalDistributed,
            bountyCount: projectBounties.length,
            submissionCount: projectSubmissions.length,
            completedBounties: completedBounties.length,
          };
        });

        setStats(projectStats);

        // Calculate global stats
        const totalDistributed = projectStats.reduce((sum, p) => sum + p.totalFundsDistributed, 0);
        const totalBounties = projectStats.reduce((sum, p) => sum + p.bountyCount, 0);
        const totalSubmissions = projectStats.reduce((sum, p) => sum + p.submissionCount, 0);

        setGlobalStats({
          totalProjects: projects.length,
          totalBounties,
          totalSubmissions,
          totalDistributed,
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-zinc-950 text-zinc-50">
        <Loader2 className="animate-spin text-zinc-500" size={48} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 bg-zinc-950 text-zinc-50 relative">
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mb-8">
        <Link href="/" className="text-zinc-400 hover:text-zinc-50 flex w-fit items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <header className="relative z-10 w-full max-w-6xl mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Analytics Dashboard</h1>
        <p className="text-zinc-400">Real-time metrics for the SparkShares ecosystem.</p>
      </header>

      {/* Global Stats */}
      <section className="relative z-10 w-full max-w-6xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Projects', value: globalStats.totalProjects, icon: TrendingUp, color: 'cyan' },
            { label: 'Open Bounties', value: globalStats.totalBounties, icon: Zap, color: 'fuchsia' },
            { label: 'Submissions', value: globalStats.totalSubmissions, icon: Users, color: 'indigo' },
            { label: 'SOL Distributed', value: globalStats.totalDistributed.toFixed(2), icon: Award, color: 'emerald' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/60 border-zinc-800 rounded-2xl backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-400 mt-2`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`text-${stat.color}-400 opacity-50`} size={32} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project-Level Stats */}
      <section className="relative z-10 w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6">Project Breakdown</h2>
        {stats.length === 0 ? (
          <Card className="bg-zinc-900/60 border-zinc-800 rounded-2xl backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-400">No projects launched yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((project) => (
              <Card key={project.projectId} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-2xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{project.projectName}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {project.completedBounties} / {project.bountyCount} bounties completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Funds Raised</p>
                      <p className="text-lg font-bold text-cyan-400">{project.totalFundsRaised.toFixed(2)} SOL</p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Distributed</p>
                      <p className="text-lg font-bold text-emerald-400">{project.totalFundsDistributed.toFixed(2)} SOL</p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bounties</p>
                      <p className="text-lg font-bold text-fuchsia-400">{project.bountyCount}</p>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Submissions</p>
                      <p className="text-lg font-bold text-indigo-400">{project.submissionCount}</p>
                    </div>
                  </div>

                  {project.totalFundsRaised > 0 && (
                    <div className="pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Payout Rate</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {((project.totalFundsDistributed / project.totalFundsRaised) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              (project.totalFundsDistributed / project.totalFundsRaised) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
