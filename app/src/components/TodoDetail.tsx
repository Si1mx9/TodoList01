import { useState } from 'react';
import { TodoItem } from '@/models/TodoItem';
import { Project } from '@/models/Project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from '@/components/ui/sheet';
import { Priority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';
import {
  Calendar as CalendarIcon,
  Flag,
  Plus,
  Trash2,
  X,
  Folder,
  Clock,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  AlignLeft,
  ListTodo
} from 'lucide-react';
import { format, isPast, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TodoDetailProps {
  todo: TodoItem | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    todoId: string,
    updates: {
      title?: string;
      description?: string;
      dueDate?: Date | null;
      priority?: number;
      notes?: string;
      isComplete?: boolean;
    }
  ) => void;
  onDelete: (todoId: string) => void;
  onMoveToProject: (todoId: string, newProjectId: string) => void;
  onAddChecklistItem: (todoId: string, text: string) => void;
  onToggleChecklistItem: (todoId: string, itemId: string) => void;
  onRemoveChecklistItem: (todoId: string, itemId: string) => void;
}

export function TodoDetail({
  todo,
  projects,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onMoveToProject,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
}: TodoDetailProps) {
  const [newChecklistItem, setNewChecklistItem] = useState('');

  if (!todo) return null;

  const isOverdue = todo.dueDate && isPast(startOfDay(todo.dueDate)) && !todo.isComplete;

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      onAddChecklistItem(todo.id, newChecklistItem.trim());
      setNewChecklistItem('');
    }
  };

  const completedChecklistCount = todo.checklist.filter((i) => i.isChecked).length;
  const checklistProgress = todo.checklist.length > 0
    ? (completedChecklistCount / todo.checklist.length) * 100
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[100vw] sm:max-w-xl h-full max-h-screen overflow-hidden flex flex-col bg-background/80 backdrop-blur-3xl border-l border-border/40 shadow-2xl shadow-black/10 z-[100] p-0">
        <SheetHeader className="space-y-4 p-6 sm:p-8 pb-6 border-b border-border/40 bg-gradient-to-b from-background/80 to-transparent">
          <div className="flex items-start justify-between gap-4">
             <div className="flex items-start gap-5 pt-1 w-full">
              <button
                onClick={() => onUpdate(todo.id, { isComplete: !todo.isComplete })}
                className={cn(
                  "mt-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/20",
                  todo.isComplete 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "border-muted-foreground/30 hover:border-primary/60 bg-background/50"
                )}
              >
                <CheckCircle2 className={cn(
                  "w-4 h-4 transition-transform duration-300", 
                  todo.isComplete ? "scale-100" : "scale-0 opacity-0"
                )} />
              </button>
              
              <div className="space-y-4 flex-1">
                <Input
                  value={todo.title}
                  onChange={(e) => onUpdate(todo.id, { title: e.target.value })}
                  className={cn(
                    "text-2xl sm:text-3xl font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40",
                    todo.isComplete ? "text-muted-foreground line-through decoration-2 decoration-border" : "text-foreground"
                  )}
                  placeholder="Titre de la tâche"
                />
                
                <div className="flex items-center gap-2.5 flex-wrap">
                   <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full px-3 py-1 font-medium border-0 transition-colors',
                      todo.isComplete 
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-primary/10 text-primary dark:text-primary'
                    )}
                  >
                    {todo.isComplete ? 'Terminée' : 'En cours'}
                  </Badge>
                  
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full px-3 py-1 font-medium border-0 bg-opacity-20 backdrop-blur-sm',
                      PRIORITY_COLORS[todo.priority]
                    )}
                  >
                    <Flag className="w-3 h-3 mr-1.5" />
                    {PRIORITY_LABELS[todo.priority]}
                  </Badge>

                  {isOverdue && (
                    <Badge variant="destructive" className="rounded-full px-3 py-1 font-medium border-0 shadow-sm">
                      <AlertCircle className="w-3 h-3 mr-1.5" />
                      En retard
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 -mx-6 sm:-mx-8 px-6 sm:px-8 bg-muted/5 overflow-y-auto custom-scrollbar">
          <div className="space-y-8 py-8">
            {/* Description */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2 text-muted-foreground/80">
                <AlignLeft className="w-4 h-4" />
                <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
              </div>
              <Textarea
                value={todo.description}
                onChange={(e) => onUpdate(todo.id, { description: e.target.value })}
                rows={3}
                placeholder="Ajouter une description..."
                className="resize-none bg-background/50 border-border/40 focus:border-primary/30 focus:bg-background transition-all leading-relaxed shadow-sm min-h-[100px]"
              />
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-background/60 border border-border/40 hover:bg-background/80 transition-all shadow-sm">
                <Label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-primary/70" />
                  Date d'échéance
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9 px-0 hover:bg-transparent hover:text-primary transition-colors text-base',
                        !todo.dueDate && 'text-muted-foreground',
                        isOverdue && 'text-rose-600 font-medium'
                      )}
                    >
                      {todo.dueDate
                        ? format(todo.dueDate, 'dd MMMM yyyy', { locale: fr })
                        : 'Définir une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl border-border/40 shadow-xl z-[110]" align="start">
                    <Calendar
                      mode="single"
                      selected={todo.dueDate || undefined}
                      onSelect={(date) => onUpdate(todo.id, { dueDate: date || null })}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-background/60 border border-border/40 hover:bg-background/80 transition-all shadow-sm">
                <Label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-primary/70" />
                  Projet
                </Label>
                <Select
                  value={todo.projectId}
                  onValueChange={(value) => onMoveToProject(todo.id, value)}
                >
                  <SelectTrigger className="h-9 border-0 bg-transparent px-0 focus:ring-0 shadow-none font-medium hover:text-primary transition-colors text-base">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {projects.find((p) => p.id === todo.projectId)?.name || 'Projet'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95 z-[110]">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id} className="focus:bg-primary/10 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full ring-2 ring-white/20"
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
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Priorité</Label>
              <div className="flex gap-2 p-1 bg-background/40 rounded-xl border border-border/30">
                {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'flex-1 gap-2 h-8 rounded-lg transition-all',
                      todo.priority === p 
                        ? cn(
                            'shadow-sm',
                            p === Priority.HIGH && 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20',
                            p === Priority.MEDIUM && 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
                            p === Priority.LOW && 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          )
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                    onClick={() => onUpdate(todo.id, { priority: p })}
                  >
                    <Flag className={cn("w-3.5 h-3.5", todo.priority === p && "fill-current")} />
                    <span className="text-xs font-medium">{PRIORITY_LABELS[p]}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <ListTodo className="w-4 h-4" />
                  <Label className="text-xs font-bold uppercase tracking-wider">Checklist</Label>
                </div>
                {todo.checklist.length > 0 && (
                  <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                    {completedChecklistCount}/{todo.checklist.length}
                  </span>
                )}
              </div>
              
              {todo.checklist.length > 0 && (
                <div className="w-full bg-muted/40 rounded-full h-1 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      checklistProgress === 100 ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {todo.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 group px-3 py-2 rounded-lg hover:bg-background/60 border border-transparent hover:border-border/30 transition-all"
                  >
                    <Checkbox
                      checked={item.isChecked}
                      onCheckedChange={() => onToggleChecklistItem(todo.id, item.id)}
                      className="w-4 h-4 rounded-full border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm font-medium transition-colors',
                        item.isChecked ? 'line-through text-muted-foreground decoration-border' : 'text-foreground'
                      )}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                      onClick={() => onRemoveChecklistItem(todo.id, item.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 items-center pl-2 group">
                <CornerDownRight className="w-4 h-4 text-muted-foreground/40" />
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Ajouter une sous-tâche..."
                    className="h-9 bg-background/40 border-border/40 focus:border-primary/30 focus:bg-background text-sm transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistItem.trim()}
                    className="shrink-0 h-9 w-9 bg-background/40 border border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Notes */}
            <div className="space-y-3">
               <Label className="text-xs font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                 Notes
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                <Textarea
                  value={todo.notes}
                  onChange={(e) => onUpdate(todo.id, { notes: e.target.value })}
                  rows={6}
                  placeholder="Notes personnelles..."
                  className="pl-8 resize-none bg-yellow-50/50 dark:bg-zinc-900/50 border-border/30 focus:border-primary/30 focus:bg-background/80 transition-all leading-7 font-serif text-sm text-foreground/90 placeholder:text-muted-foreground/50 shadow-sm"
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 justify-center pt-4">
              <Clock className="w-3 h-3" />
              <span>
                Créée le {format(todo.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/40 p-4 flex justify-between bg-background/40 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDelete(todo.id);
              onClose();
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide font-semibold">Supprimer</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-background/50 hover:bg-accent border-border/50 transition-colors gap-2"
          >
            <span className="text-xs uppercase tracking-wide font-semibold">Fermer</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
