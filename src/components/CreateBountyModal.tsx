'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateBountyModal({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward_amount: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from('micro_grants').insert({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        reward_amount: parseFloat(formData.reward_amount),
        status: 'open'
      });

      if (error) throw error;
      
      setOpen(false);
      setFormData({ title: '', description: '', reward_amount: '' });
      toast.success("Bounty Created", {
        description: `Your bounty for ${projectName} has been successfully published.`
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
        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium" variant="secondary">
          <Plus size={16} className="mr-2" /> Add Bounty
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader>
          <DialogTitle>Post a Micro-Grant</DialogTitle>
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
              className="bg-zinc-900 border-zinc-800 text-white"
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
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward">Reward Amount (Tokens)</Label>
            <Input
              id="reward"
              type="number"
              min="0"
              step="0.01"
              placeholder="100.00"
              value={formData.reward_amount}
              onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
              required
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full mt-6 bg-zinc-100 hover:bg-white text-zinc-900 font-bold">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Publish Bounty
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}