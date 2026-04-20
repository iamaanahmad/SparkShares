'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export function SubmitWorkModal({ bountyId, bountyTitle }: { bountyId: string; bountyTitle: string }) {
  const { connected, publicKey } = useWallet();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proofLink, setProofLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.from('submissions').insert({
        grant_id: bountyId,
        submitter_wallet: publicKey.toBase58(),
        content: proofLink,
      });

      if (error) throw error;
      
      setOpen(false);
      setProofLink('');
      toast.success("Work Submitted!", {
        description: "The project creator has been notified to review your work."
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full font-semibold bg-indigo-600 hover:bg-indigo-500 text-white" 
          disabled={!connected}
        >
          {connected ? 'Submit Work' : 'Connect Wallet to Submit'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader>
          <DialogTitle>Submit Your Work</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Submitting work for: <span className="font-semibold text-zinc-300">{bountyTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="proof_link">Proof of Work (Link)</Label>
            <Input
              id="proof_link"
              type="url"
              placeholder="e.g. GitHub PR, Figma link, Live URL..."
              value={proofLink}
              onChange={(e) => setProofLink(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full mt-6 bg-zinc-100 hover:bg-white text-zinc-900 font-bold">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit for Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}