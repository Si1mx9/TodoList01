import { useState } from 'react';
import { Project } from '@/models/Project';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Layout,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  MoreVertical,
  FolderArchive,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import type { FilterType } from '@/types';

interface SidebarProps {
  projects: Project[];
  currentProject: Project | undefined;
  currentFilter: FilterType;
  todayCount: number;
  weekCount: number;
  overdueCount: number;
  onSelectProject: (projectId: string | null) => void;
  onSetFilter: (filter: FilterType) => void;
  onCreateProject: () => void;
  onOpenArchive: () => void;
  onArchiveProject: (projectId: string) => void;
  className?: string; // Add className optional prop
}

export function Sidebar({
  projects,
  currentProject,
  currentFilter,
  todayCount,
  weekCount,
  overdueCount,
  onSelectProject,
  onSetFilter,
  onCreateProject,
  onOpenArchive,
  onArchiveProject,
  className, // Destructure className
}: SidebarProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const totalUncompleted = projects.reduce(
    (acc, p) => acc + p.todoIds.length,
    0
  );

  const handleFilterClick = (filter: FilterType) => {
    onSetFilter(filter);
    onSelectProject(null);
  };

  const NavItem = ({
    icon: Icon,
    label,
    count,
    isActive,
    onClick,
    colorClass = "text-foreground",
    badgeVariant = "secondary"
  }: {
    icon: any;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
    colorClass?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-4 h-11 px-4 mb-1 transition-all duration-300 ease-out group relative overflow-hidden",
        isActive 
          ? "bg-primary/10 text-primary font-semibold shadow-sm" 
          : "hover:bg-muted/60 hover:translate-x-1 text-muted-foreground hover:text-foreground"
      )}
    >
      <div className={cn(
        "relative z-10 flex items-center justify-center transition-transform duration-300",
        isActive ? "scale-110" : "group-hover:scale-110"
      )}>
        <Icon className={cn("w-5 h-5", isActive ? "text-primary" : colorClass)} />
      </div>
      <span className="relative z-10 flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant={badgeVariant} 
          className={cn(
            "relative z-10 ml-auto transition-all duration-300",
            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-background"
          )}
        >
          {count}
        </Badge>
      )}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent opacity-50" />
      )}
    </Button>
  );

  return (
    <aside className={cn("w-80 bg-background/50 backdrop-blur-2xl border-r border-border/40 flex flex-col h-full shadow-2xl shadow-black/5 z-50", className)}>
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/20 transform transition-transform hover:rotate-3 hover:scale-105 duration-300 group cursor-default">
            <CheckCircle2 className="w-7 h-7 text-white drop-shadow-md group-hover:animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Todo Master
            </h1>
            <p className="text-xs font-medium text-muted-foreground/80 tracking-wide uppercase">Workspace</p>
          </div>
        </div>

        {/* Global Search (Visual only for now) */}
        <div className="relative mb-6 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-hover:text-primary/70" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/40 border border-transparent focus:bg-background focus:border-primary/20 hover:bg-muted/60 transition-all outline-none text-sm placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-8 pb-4">
          {/* Quick Filters */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-4 mb-3">
              Vue d'ensemble
            </p>
            <NavItem 
              icon={Layout} 
              label="Toutes les tâches" 
              count={totalUncompleted}
              isActive={!currentProject && currentFilter === 'all'}
              onClick={() => handleFilterClick('all')}
              colorClass="text-slate-500"
            />
            <NavItem 
              icon={Calendar} 
              label="Aujourd'hui" 
              count={todayCount}
              isActive={!currentProject && currentFilter === 'today'}
              onClick={() => handleFilterClick('today')}
              colorClass="text-emerald-500"
              badgeVariant={todayCount > 0 ? "default" : "secondary"}
            />
            <NavItem 
              icon={Clock} 
              label="Cette semaine" 
              count={weekCount}
              isActive={!currentProject && currentFilter === 'week'}
              onClick={() => handleFilterClick('week')}
              colorClass="text-blue-500"
            />
            <NavItem 
              icon={AlertCircle} 
              label="En retard" 
              count={overdueCount}
              isActive={!currentProject && currentFilter === 'overdue'}
              onClick={() => handleFilterClick('overdue')}
              colorClass="text-rose-500"
              badgeVariant="destructive"
            />
          </div>

          <Separator className="bg-border/40 mx-2 w-auto" />

          {/* Projects */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-4 mb-3 group">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                Mes Projets
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                onClick={onCreateProject}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {projects.map((project) => (
              <div
                key={project.id}
                className="relative group/item"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-4 h-11 px-4 mb-1 transition-all duration-300 border border-transparent',
                    currentProject?.id === project.id 
                      ? 'bg-background border-border/50 shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300 ring-2 ring-transparent",
                        currentProject?.id === project.id ? "ring-offset-2 scale-110" : ""
                      )}
                      style={{ 
                        backgroundColor: project.color,
                        boxShadow: currentProject?.id === project.id ? `0 0 10px ${project.color}` : 'none'
                      }}
                    />
                  </div>
                  <span className="truncate flex-1 text-sm font-medium">{project.name}</span>
                  {project.todoIds.length > 0 && (
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      currentProject?.id === project.id ? "text-muted-foreground" : "text-muted-foreground/40"
                    )}>
                      {project.todoIds.length}
                    </span>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground transition-all duration-200",
                        hoveredProject === project.id ? "opacity-100" : "opacity-0 pointer-events-none"
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background/90 backdrop-blur-xl border-border/40 shadow-xl rounded-xl">
                      <DropdownMenuItem
                        onClick={() => onArchiveProject(project.id)}
                        className="gap-2 focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                      >
                        <FolderArchive className="w-4 h-4" />
                        Archiver le projet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            
            <Button
              variant="ghost" 
              className="w-full justify-start gap-3 h-10 px-4 mt-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-dashed border-border/50 hover:border-primary/50"
              onClick={onCreateProject}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nouveau projet</span>
            </Button>

            {projects.length === 0 && (
              <div className="mx-4 text-center py-10 rounded-2xl border border-dashed border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors group cursor-pointer" onClick={onCreateProject}>
                <div className="w-10 h-10 mx-auto bg-background rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground/80">
                  Créer un projet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Organisez vos tâches
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 bg-background/30 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-3 h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-background/60 rounded-xl transition-all"
            onClick={onOpenArchive}
          >
            <Archive className="w-4 h-4" />
            <span className="text-sm font-medium">Archives</span>
          </Button>
          <div className="w-px h-6 bg-border/50" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
