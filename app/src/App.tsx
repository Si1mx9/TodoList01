import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TodoList } from '@/components/TodoList';
import { TodoForm } from '@/components/TodoForm';
import { ProjectForm } from '@/components/ProjectForm';
import { TodoDetail } from '@/components/TodoDetail';
import { useTodoApp } from '@/hooks/useTodoApp';
import { TodoItem } from '@/models/TodoItem';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CheckCircle2, Layout, Archive, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

function App() {
  const {
    currentProject,
    projects,
    archivedProjects,
    filteredTodos,
    filter,
    sort,
    todayCount,
    weekCount,
    overdueCount,
    setFilter,
    setSort,
    createProject,
    setCurrentProject,
    archiveProject,
    unarchiveProject,
    createTodo,
    deleteTodo,
    updateTodo,
    toggleTodoComplete,
    moveTodoToProject,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
  } = useTodoApp();

  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const handleTodoClick = (todo: TodoItem) => {
    setSelectedTodo(todo);
  };

  const handleCloseTodoDetail = () => {
    setSelectedTodo(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 pointer-events-none" />

      {/* Desktop Sidebar */}
      <Sidebar
        className="hidden md:flex"
        projects={projects}
        currentProject={currentProject}
        currentFilter={filter}
        todayCount={todayCount}
        weekCount={weekCount}
        overdueCount={overdueCount}
        onSelectProject={setCurrentProject}
        onSetFilter={setFilter}
        onCreateProject={() => setIsProjectFormOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onArchiveProject={archiveProject}
      />

      {/* Mobile Sidebar (Sheet) */}
      <Sheet>
        <SheetContent side="left" className="p-0 w-80 border-r border-border/40">
           <Sidebar
            className="w-full border-0"
            projects={projects}
            currentProject={currentProject}
            currentFilter={filter}
            todayCount={todayCount}
            weekCount={weekCount}
            overdueCount={overdueCount}
            onSelectProject={(id) => {
              setCurrentProject(id);
              // Close sheet logic would go here if we had control, but for now relies on user tapping outside or we need a controlled sheet state for mobile nav.
              // For simplicity in this step, let's keep it uncontrolled or just let user close it.
            }}
            onSetFilter={(f) => {
              setFilter(f);
            }}
            onCreateProject={() => setIsProjectFormOpen(true)}
            onOpenArchive={() => setIsArchiveOpen(true)}
            onArchiveProject={archiveProject}
          />
        </SheetContent>
        {/* We need the Trigger to be in the Header, so we might need to lift the Sheet state up or put the Trigger there. 
            Actually, shadcn Sheet usually requires Trigger and Content to be children of Root. 
            To put the trigger in the header, we can use a controlled state for the Sheet.
        */}
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm relative overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl px-4 md:px-8 py-4 md:py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Mobile Menu Trigger - We need a controlled sheet for this to work cleanly across the tree, 
                  OR we can just put a Sheet here locally for the mobile menu if we want.
                  Let's use a local controlled state for the mobile sidebar.
              */}
              <Sheet>
                 <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-foreground">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 border-r border-border/40">
                  <Sidebar
                    className="w-full border-0"
                    projects={projects}
                    currentProject={currentProject}
                    currentFilter={filter}
                    todayCount={todayCount}
                    weekCount={weekCount}
                    overdueCount={overdueCount}
                    onSelectProject={setCurrentProject}
                    onSetFilter={setFilter}
                    onCreateProject={() => setIsProjectFormOpen(true)}
                    onOpenArchive={() => setIsArchiveOpen(true)}
                    onArchiveProject={archiveProject}
                  />
                </SheetContent>
              </Sheet>

              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/10 transition-transform hover:scale-105"
                style={{ backgroundColor: currentProject?.color || '#3b82f6' }}
              >
                <Layout className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                  {currentProject?.name || 'Toutes les tâches'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground font-medium hidden sm:block">
                  {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsTodoFormOpen(true)} 
              className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 h-9 md:h-11 px-3 md:px-6 text-xs md:text-sm"
              size="default"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Nouvelle tâche</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </header>

        {/* Filters & Stats */}
        <div className="border-b border-border/50 bg-background/30 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between gap-4 min-w-[500px] md:min-w-0">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="bg-muted/50 p-1 border border-border/50">
                <TabsTrigger value="all" className="gap-2 px-3 md:px-4 text-xs md:text-sm">
                  Toutes
                  <Badge variant="secondary" className="ml-1 bg-background/50 px-1 py-0 h-4 min-w-[1.25rem] text-[10px]">
                    {filteredTodos.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="today" className="gap-2 px-3 md:px-4 text-xs md:text-sm">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Aujourd'hui
                  {todayCount > 0 && (
                    <Badge variant="default" className="ml-1 bg-primary text-primary-foreground px-1 py-0 h-4 min-w-[1.25rem] text-[10px]">
                      {todayCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="uncompleted" className="gap-2 px-3 md:px-4 text-xs md:text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  À faire
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium hidden md:inline">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="text-sm border border-border/50 rounded-lg px-2 py-1.5 md:px-3 md:py-2 bg-muted/30 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer hover:bg-muted/50"
              >
                <option value="date">Date</option>
                <option value="priority">Priorité</option>
                <option value="created">Création</option>
                <option value="title">Titre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
              <TodoList
                todos={filteredTodos}
                projects={projects}
                onTodoClick={handleTodoClick}
                onToggleComplete={toggleTodoComplete}
                onDelete={deleteTodo}
              />
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Todo Form Dialog */}
      <Dialog open={isTodoFormOpen} onOpenChange={setIsTodoFormOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] sm:w-full rounded-xl">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <TodoForm
            projects={projects}
            currentProjectId={currentProject?.id}
            onSubmit={(data) => {
              createTodo(data.title, data.projectId, {
                description: data.description,
                dueDate: data.dueDate,
                priority: data.priority,
                notes: data.notes,
              });
              setIsTodoFormOpen(false);
            }}
            onCancel={() => setIsTodoFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* ... other dialogs need similar mobile checks, but usually standard dialogs are somewhat responsive by default ... */}

      {/* Project Form Dialog */}
      <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
           <DialogHeader>
            <DialogTitle>Nouveau projet</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={(name) => {
              createProject(name);
              setIsProjectFormOpen(false);
            }}
            onCancel={() => setIsProjectFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Projets archivés
            </DialogTitle>
          </DialogHeader>
           <ScrollArea className="max-h-[400px]">
             <div className="space-y-2">
              {archivedProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun projet archivé
                </p>
              ) : (
                archivedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        unarchiveProject(project.id);
                      }}
                    >
                      Désarchiver
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Todo Detail Drawer */}
      <TodoDetail
        todo={selectedTodo}
        projects={projects}
        isOpen={!!selectedTodo}
        onClose={handleCloseTodoDetail}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        onMoveToProject={moveTodoToProject}
        onAddChecklistItem={addChecklistItem}
        onToggleChecklistItem={toggleChecklistItem}
        onRemoveChecklistItem={removeChecklistItem}
      />
    </div>
  );
}

export default App;
