'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { LaunchProjectModal } from '@/components/LaunchProjectModal';
import Link from 'next/link';

// Dynamically load to avoid SSR hydration issues with browser wallets
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 bg-black text-zinc-50 relative overflow-hidden bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]">
      {/* Top Cyberpunk Neon Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_cyan]" />

      <header className="w-full max-w-5xl flex justify-between items-center mb-12 relative z-10">
        <h1 className="text-xl md:text-2xl font-mono font-bold tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] uppercase">
          SPARKSHARES //
        </h1>
        <WalletMultiButtonDynamic />
      </header>

      <section className="text-center mt-12 md:mt-20 max-w-3xl relative z-10">  
        <h2 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-6 leading-tight uppercase">
          Tokenize Ideas.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]">
            Fund the Future.
          </span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 mb-12 font-mono max-w-2xl mx-auto uppercase tracking-wide">
          > Launch a project token on Bags, auto-fund your community, and distribute micro-grants directly to builders. All on Solana.
        </p>

        {connected ? (
          <div className="flex flex-col items-center mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 px-5 py-2 border border-cyan-500/50 bg-black/80 backdrop-blur-md mb-10 shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-none">
              <span className="w-2 h-2 bg-cyan-400 animate-pulse shadow-[0_0_5px_cyan]" />
              <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">   
                SYS_ACT: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-none font-mono font-bold uppercase tracking-widest bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] px-8 transition-all">
                  Dashboard
                </Button>
              </Link>
              <div className="w-full sm:w-auto">
                <LaunchProjectModal />
              </div>
              <Link href="/bounties" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none font-mono font-bold uppercase tracking-widest bg-transparent border border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] px-8 transition-all">
                  Explore Bounties
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-zinc-800 bg-black/80 backdrop-blur-md inline-block shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-none">
            <p className="text-cyan-400 font-mono font-medium tracking-widest uppercase">
              > _Awaiting Solana Connection...
            </p>
          </div>
        )}
      </section>

      <footer className="mt-auto pt-24 font-mono text-zinc-600 text-xs uppercase tracking-widest">
        // Built for the Bags Hackathon.
      </footer>
    </main>
  );
}
