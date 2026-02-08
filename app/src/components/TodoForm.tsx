import { useState } from 'react';
import { Project } from '@/models/Project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Priority, PRIORITY_LABELS } from '@/types';
import { CalendarIcon, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TodoFormProps {
  projects: Project[];
  currentProjectId?: string;
  onSubmit: (data: {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: number;
    projectId: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export function TodoForm({
  projects,
  currentProjectId,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<number>(Priority.MEDIUM);
  const [projectId, setProjectId] = useState(currentProjectId || projects[0]?.id || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      projectId,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">Titre de la tâche</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Qu'avez-vous prévu de faire ?"
            autoFocus
            required
            className="h-12 text-lg bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ajoutez des détails, des liens, ou des sous-tâches..."
            rows={3}
            className="resize-none bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date d'échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-11 bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dueDate ? format(dueDate, 'dd MMMM yyyy', { locale: fr }) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={(date) => setDueDate(date || null)}
                  initialFocus
                  className="rounded-lg border shadow-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Projet</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-11 bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all">
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium">{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Priorité</Label>
          <div className="flex gap-3">
            {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? 'default' : 'outline'}
                className={cn(
                  'flex-1 gap-2 h-10 transition-all duration-300 border-border/50',
                  priority === p && p === Priority.HIGH && 'bg-rose-500 hover:bg-rose-600 border-rose-600 shadow-md shadow-rose-500/20',
                  priority === p && p === Priority.MEDIUM && 'bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-md shadow-amber-500/20',
                  priority === p && p === Priority.LOW && 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/20',
                  priority !== p && 'hover:border-primary/30 hover:bg-muted/50'
                )}
                onClick={() => setPriority(p)}
              >
                <Flag className={cn("w-4 h-4", priority !== p && "text-muted-foreground")} />
                <span className={cn(priority !== p && "text-muted-foreground")}>{PRIORITY_LABELS[p]}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes personnelles..."
            rows={2}
            className="resize-none bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
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
          disabled={!title.trim()}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all w-32"
        >
          Créer
        </Button>
      </div>
    </form>
  );
}
