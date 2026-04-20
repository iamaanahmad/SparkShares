'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
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
            {projects.map((project) => (
              <Card key={project.id} className="bg-zinc-900 border-zinc-800 text-left hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
                  <CardDescription className="text-zinc-400 truncate" title={project.description}>
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs bg-zinc-950 p-2 rounded-md border border-zinc-800 break-all font-mono text-zinc-500">
                    Bags Mint: {project.bags_token_mint || 'Pending...'}
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <CreateBountyModal projectId={project.id} projectName={project.name} />
                    <ViewBountiesModal projectId={project.id} projectName={project.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}