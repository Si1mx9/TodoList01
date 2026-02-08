import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus } from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm font-medium">Nom du projet</Label>
          <div className="relative">
            <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon nouveau projet"
              className="pl-10 h-12 text-lg bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
              autoFocus
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={!name.trim()}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
        >
          Créer le projet
        </Button>
      </div>
    </form>
  );
}
