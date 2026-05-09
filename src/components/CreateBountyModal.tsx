'use client';

import { useState } from 'react';
import { createBounty } from '@/lib/appwrite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Vote } from 'lucide-react';
import { toast } from 'sonner';

export function CreateBountyModal({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward_amount: '',
    voting_enabled: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createBounty({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        reward_amount: parseFloat(formData.reward_amount),
        status: 'open',
        voting_enabled: formData.voting_enabled,
      });

      setOpen(false);
      setFormData({ title: '', description: '', reward_amount: '', voting_enabled: false });
      toast.success("Bounty Created", {
        description: `Your ${formData.voting_enabled ? 'community-voted ' : ''}bounty for ${projectName} has been published.`
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to create bounty", {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg" variant="secondary">
          <Plus size={16} className="mr-2" /> Add Bounty
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Post a Micro-Grant</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Fund a specific task for <span className="font-semibold text-zinc-300">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g. Design a logo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-zinc-900 border-zinc-800 text-white rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Details of the work required..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-zinc-900 border-zinc-800 text-white rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward">Reward Amount (SOL)</Label>
            <Input
              id="reward"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.5"
              value={formData.reward_amount}
              onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
              required
              className="bg-zinc-900 border-zinc-800 text-white rounded-lg"
            />
          </div>

          {/* Community Voting Toggle */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="text-fuchsia-400" size={18} />
                <div>
                  <span className="text-sm font-bold text-zinc-200">Community Voting</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Let token holders vote on submissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, voting_enabled: !formData.voting_enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.voting_enabled ? 'bg-fuchsia-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    formData.voting_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full mt-6 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg h-12">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Publish Bounty
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}