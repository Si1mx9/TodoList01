import { TodoItem } from '@/models/TodoItem';
import { Project } from '@/models/Project';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Trash2,
  AlertCircle,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Priority, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoListProps {
  todos: TodoItem[];
  projects: Project[];
  onTodoClick: (todo: TodoItem) => void;
  onToggleComplete: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export function TodoList({
  todos,
  projects,
  onTodoClick,
  onToggleComplete,
  onDelete,
}: TodoListProps) {
  const getProjectColor = (projectId: string): string => {
    const project = projects.find((p) => p.id === projectId);
    return project?.color || '#3b82f6';
  };

  const getProjectName = (projectId: string): string => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Projet inconnu';
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Pas de date';
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'dd MMM', { locale: fr });
  };

  const isOverdue = (date: Date | null): boolean => {
    if (!date) return false;
    return isPast(startOfDay(date));
  };

  if (todos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20 text-center bg-card/30 backdrop-blur-md rounded-3xl border border-dashed border-border/50"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-3">Tout est propre !</h3>
        <p className="text-muted-foreground max-w-md px-4 leading-relaxed">
          Vous n'avez aucune tâche en cours. Profitez de votre temps libre ou commencez un nouveau projet inspirant.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {todos.map((todo, index) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
            className="group"
          >
            <div
              className={cn(
                'relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 cursor-pointer group',
                todo.isComplete && 'opacity-60 grayscale-[20%]'
              )}
              onClick={() => onTodoClick(todo)}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    checked={todo.isComplete}
                    onCheckedChange={() => onToggleComplete(todo.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 rounded-full border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <h3
                      className={cn(
                        'text-lg font-semibold truncate transition-colors flex-1 min-w-0',
                        todo.isComplete ? 'line-through text-muted-foreground' : 'text-card-foreground group-hover:text-primary'
                      )}
                    >
                      {todo.title}
                    </h3>
                    {todo.priority === Priority.HIGH && !todo.isComplete && (
                      <div className="text-rose-500 animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {todo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {todo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap pt-1">
                    {/* Priority Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs px-2.5 py-0.5 rounded-full font-medium border-0',
                        PRIORITY_COLORS[todo.priority],
                        'bg-opacity-10 backdrop-blur-md'
                      )}
                    >
                      {PRIORITY_LABELS[todo.priority]}
                    </Badge>

                    {/* Date */}
                    {todo.dueDate && (
                      <div
                        className={cn(
                          'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border/30',
                          isOverdue(todo.dueDate) && !todo.isComplete
                            ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatDate(todo.dueDate)}</span>
                      </div>
                    )}

                    {/* Project */}
                    <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
                      <div
                        className="w-2 h-2 rounded-full ring-2 ring-white/10"
                        style={{ backgroundColor: getProjectColor(todo.projectId) }}
                      />
                      <span className="font-medium">{getProjectName(todo.projectId)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(todo.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
