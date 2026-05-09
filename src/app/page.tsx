'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { LaunchProjectModal } from '@/components/LaunchProjectModal';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Zap, Shield, BarChart3, Rocket, ArrowRight, Users, Coins, Award, ExternalLink } from 'lucide-react';
import { listProjects, listBounties, listSubmissions } from '@/lib/appwrite';

// Dynamically load to avoid SSR hydration issues with browser wallets
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [stats, setStats] = useState({ projects: 0, bounties: 0, submissions: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projects, bounties, submissions] = await Promise.all([
          listProjects(), listBounties(), listSubmissions()
        ]);
        setStats({
          projects: projects.length,
          bounties: bounties.length,
          submissions: submissions.length,
        });
      } catch { /* silent */ }
    }
    fetchStats();
  }, []);

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* ═══════════════ Background Effects ═══════════════ */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />

      {/* Floating orbs */}
      <div className="fixed top-20 left-[10%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-40 right-[10%] w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Top neon accent line */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.6)] z-50" />

      {/* ═══════════════ Navigation ═══════════════ */}
      <header className="relative z-40 w-full px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="SparkShares" width={180} height={40} className="h-9 w-auto drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/bounties" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors font-medium tracking-wide">Bounties</Link>
            <Link href="/analytics" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors font-medium tracking-wide">Analytics</Link>
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors font-medium tracking-wide">Dashboard</Link>
            <a href="https://bags.fm/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-fuchsia-400 transition-colors font-medium tracking-wide flex items-center gap-1">
              Bags <ExternalLink size={12} />
            </a>
          </div>

          <WalletMultiButtonDynamic />
        </nav>
      </header>

      {/* ═══════════════ Hero Section ═══════════════ */}
      <section className="relative z-10 px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border-cyan mb-8 animate-slide-up opacity-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-mono text-cyan-300 tracking-widest uppercase">Built on Bags × Solana</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8 animate-slide-up-delayed opacity-0">
            <span className="block">Tokenize Ideas.</span>
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              Fund the Future.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed mb-12 animate-slide-up-delayed-2 opacity-0">
            Launch project tokens on Bags, auto-fund your community with micro-grants, and distribute rewards directly to builders — all powered by Solana and fee-sharing.
          </p>

          {/* CTA Buttons */}
          {connected ? (
            <div className="flex flex-col items-center gap-6 animate-fade-in-delayed opacity-0">
              {/* Connected status */}
              <div className="flex items-center gap-3 px-5 py-2.5 glass neon-border-cyan rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-cyan-300 font-mono text-sm tracking-wider">
                  {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center">
                <div className="flex-1">
                  <LaunchProjectModal />
                </div>
                <Link href="/bounties" className="flex-1">
                  <Button size="lg" className="w-full h-14 text-base font-bold tracking-wide rounded-xl bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(217,70,239,0.5)] transition-all border-0">
                    Explore Bounties
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full h-14 text-base font-bold tracking-wide rounded-xl bg-zinc-900/50 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-fade-in-delayed opacity-0">
              <div className="glass rounded-xl px-8 py-6 neon-border-cyan animate-glow-pulse">
                <p className="text-cyan-300 font-mono text-sm tracking-wider mb-1">SYSTEM STATUS</p>
                <p className="text-zinc-400 text-sm">Connect your Solana wallet to get started</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ Live Stats Section ═══════════════ */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: stats.projects, label: 'Active Projects', icon: Rocket, color: 'cyan', suffix: '+' },
            { value: stats.bounties, label: 'Open Bounties', icon: Zap, color: 'fuchsia', suffix: '+' },
            { value: stats.submissions, label: 'Submissions', icon: Users, color: 'emerald', suffix: '+' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`glass rounded-2xl p-8 text-center neon-border-${stat.color} hover:scale-105 transition-transform duration-300`}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <stat.icon className={`mx-auto mb-4 text-${stat.color}-400 opacity-60`} size={28} />
              <p className={`text-4xl font-black text-${stat.color}-400 mb-2`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ How It Works Section ═══════════════ */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              How <span className="neon-text-cyan">SparkShares</span> Works
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              From token launch to community-funded micro-grants in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Launch Token',
                desc: 'Deploy your project token on Bags with automatic fee-sharing config. One click, fully on-chain.',
                icon: Rocket,
                color: 'cyan',
              },
              {
                step: '02',
                title: 'Post Bounties',
                desc: 'Create micro-grant tasks with SOL rewards. Design logos, build features, write docs — anything.',
                icon: Zap,
                color: 'fuchsia',
              },
              {
                step: '03',
                title: 'Community Funds',
                desc: 'Backers contribute SOL to bounty pools. Token holders can vote on which submissions win.',
                icon: Coins,
                color: 'emerald',
              },
              {
                step: '04',
                title: 'Approve & Pay',
                desc: 'Review submissions, approve winners, and auto-distribute micro-grants via Solana. Instant payouts.',
                icon: Award,
                color: 'amber',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="group relative glass rounded-2xl p-8 hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-${item.color}-500/20 border border-${item.color}-500/40 flex items-center justify-center`}>
                  <span className={`text-xs font-black text-${item.color}-400`}>{item.step}</span>
                </div>

                <item.icon
                  className={`mb-6 text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}
                  size={32}
                />
                <h3 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Feature Highlights ═══════════════ */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Why Builders Choose <span className="neon-text-fuchsia">SparkShares</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="glass rounded-2xl p-8 neon-border-cyan group hover:scale-[1.03] transition-all duration-500">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <Shield className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Fee-Sharing on Bags</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every token launch configures Bags V2 fee-sharing — creators earn trading royalties automatically. Set custom BPS splits for collaborators and curators.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="glass rounded-2xl p-8 neon-border-fuchsia group hover:scale-[1.03] transition-all duration-500">
              <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
                <Users className="text-fuchsia-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Voting</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Token holders vote on bounty submissions. Democratic micro-grants where the community decides which builders get funded. True decentralized governance.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="glass rounded-2xl p-8 neon-border-emerald group hover:scale-[1.03] transition-all duration-500">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <BarChart3 className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Track funds raised, bounties completed, payouts distributed, and fee splits. Live dashboards for creators, backers, and contributors alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Bags Integration Callout ═══════════════ */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden gradient-border">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fuchsia-500/10 to-transparent rounded-full blur-[60px]" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 mb-6">
                <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase">Powered By</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Built on <span className="neon-text-cyan">Bags</span> × <span className="text-fuchsia-400">Solana</span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
                SparkShares uses the Bags SDK for token launches with Meteora Dynamic Bonding Curves, configurable fee-sharing (V2), and the Solana blockchain for instant, low-cost micro-grant payouts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://bags.fm/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all px-8">
                    <ExternalLink size={16} className="mr-2" /> Visit Bags Platform
                  </Button>
                </a>
                <a href="https://docs.bags.fm/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all px-8">
                    SDK Documentation <ArrowRight size={16} className="ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="relative z-10 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="SparkShares" width={140} height={32} className="h-7 w-auto opacity-60" />
            </div>

            <div className="flex items-center gap-8">
              <Link href="/bounties" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Bounties</Link>
              <Link href="/analytics" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Analytics</Link>
              <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard</Link>
              <a href="https://github.com/iamaanahmad/SparkShares" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">GitHub</a>
            </div>

            <p className="text-xs text-zinc-600 tracking-wider">
              Built for the <a href="https://bags.fm/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-400 transition-colors">Bags Hackathon</a> &bull; Powered by Solana
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
