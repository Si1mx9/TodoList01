import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState } from '@/models/AppState';
import { TodoItem } from '@/models/TodoItem';
import { Project } from '@/models/Project';
import { Storage } from '@/services/Storage';
import { type FilterType, type SortType, Priority } from '@/types';
import { isToday, isThisWeek, isPast, startOfDay } from 'date-fns';

const initializeDefaultData = (): AppState => {
  const state = new AppState();
  const defaultProject = state.createProject('Mes Tâches');
  state.setCurrentProject(defaultProject.id);
  const today = new Date();

  state.createTodo('Bienvenue dans Todo Master !', defaultProject.id, {
    description: 'Ceci est une application de gestion de tâches moderne et intuitive.',
    priority: Priority.HIGH,
    dueDate: today,
  });
  state.createTodo('Créer un nouveau projet', defaultProject.id, {
    description: 'Cliquez sur "+ Nouveau Projet" dans la barre latérale.',
    priority: Priority.MEDIUM,
    dueDate: today,
  });
  state.createTodo('Explorer les fonctionnalités', defaultProject.id, {
    description: 'Essayez les filtres, le tri et les options de personnalisation.',
    priority: Priority.LOW,
  });

  return state;
};

function cloneState(state: AppState): AppState {
  const clone = new AppState();
  clone.projects = new Map(state.projects);
  clone.allTodos = new Map(state.allTodos);
  clone.currentProjectId = state.currentProjectId;
  return clone;
}

export function useTodoApp() {
  const [appState, setAppState] = useState<AppState>(() => {
    return Storage.load() || initializeDefaultData();
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => Storage.save(appState), 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [appState]);

  useEffect(() => {
    const handleBeforeUnload = () => Storage.save(appStateRef.current);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const withNewState = useCallback(<T>(mutator: (state: AppState) => T): T => {
    const newState = cloneState(appState);
    const result = mutator(newState);
    setAppState(newState);
    return result;
  }, [appState]);

  const createProject = useCallback((name: string): Project => {
    return withNewState((state) => state.createProject(name));
  }, [withNewState]);

  const deleteProject = useCallback((projectId: string): void => {
    withNewState((state) => { state.deleteProject(projectId); });
  }, [withNewState]);

  const setCurrentProject = useCallback((projectId: string | null): void => {
    withNewState((state) => { state.currentProjectId = projectId; });
  }, [withNewState]);

  const archiveProject = useCallback((projectId: string): void => {
    withNewState((state) => {
      const project = state.getProject(projectId);
      project?.archive();
    });
  }, [withNewState]);

  const unarchiveProject = useCallback((projectId: string): void => {
    withNewState((state) => {
      const project = state.getProject(projectId);
      project?.unarchive();
    });
  }, [withNewState]);

  const createTodo = useCallback((
    title: string,
    projectId: string,
    options?: { description?: string; dueDate?: Date | null; priority?: number; notes?: string }
  ): TodoItem => {
    return withNewState((state) => state.createTodo(title, projectId, options));
  }, [withNewState]);

  const deleteTodo = useCallback((todoId: string): void => {
    withNewState((state) => { state.deleteTodo(todoId); });
  }, [withNewState]);

  const updateTodo = useCallback((todoId: string, updates: Partial<{
    title: string; description: string; dueDate: Date | null; priority: number; notes: string; isComplete: boolean;
  }>): void => {
    withNewState((state) => {
      const todo = state.getTodo(todoId);
      if (!todo) return;
      if (updates.title !== undefined) todo.updateTitle(updates.title);
      if (updates.description !== undefined) todo.updateDescription(updates.description);
      if (updates.dueDate !== undefined) todo.updateDueDate(updates.dueDate);
      if (updates.priority !== undefined) todo.updatePriority(updates.priority);
      if (updates.notes !== undefined) todo.updateNotes(updates.notes);
      if (updates.isComplete !== undefined && todo.isComplete !== updates.isComplete) {
        todo.toggleComplete();
      }
    });
  }, [withNewState]);

  const toggleTodoComplete = useCallback((todoId: string): void => {
    withNewState((state) => state.getTodo(todoId)?.toggleComplete());
  }, [withNewState]);

  const moveTodoToProject = useCallback((todoId: string, newProjectId: string): void => {
    withNewState((state) => { state.moveTodoToProject(todoId, newProjectId); });
  }, [withNewState]);

  const addChecklistItem = useCallback((todoId: string, text: string): void => {
    withNewState((state) => state.getTodo(todoId)?.addChecklistItem(text));
  }, [withNewState]);

  const toggleChecklistItem = useCallback((todoId: string, itemId: string): void => {
    withNewState((state) => state.getTodo(todoId)?.toggleChecklistItem(itemId));
  }, [withNewState]);

  const removeChecklistItem = useCallback((todoId: string, itemId: string): void => {
    withNewState((state) => state.getTodo(todoId)?.removeChecklistItem(itemId));
  }, [withNewState]);

  const currentProject = useMemo(
    () => appState.getCurrentProject(),
    [appState]
  );

  const projects = useMemo(
    () => appState.getActiveProjects(),
    [appState]
  );

  const archivedProjects = useMemo(
    () => appState.getArchivedProjects(),
    [appState]
  );

  const filteredTodos = useMemo(
    () => {
      let todos = appState.getFilteredTodos(appState.currentProjectId, filter, sort);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        todos = todos.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }
      return todos;
    },
    [appState, filter, sort, searchQuery]
  );

  const counts = useMemo(() => {
    const allTodos = appState.getAllTodos();
    let today = 0, week = 0, overdue = 0;
    for (const t of allTodos) {
      if (t.isComplete || !t.dueDate) continue;
      if (isToday(t.dueDate)) today++;
      if (isThisWeek(t.dueDate)) week++;
      if (isPast(startOfDay(t.dueDate))) overdue++;
    }
    return { todayCount: today, weekCount: week, overdueCount: overdue };
  }, [appState]);

  return {
    appState,
    currentProject,
    projects,
    archivedProjects,
    filteredTodos,
    filter,
    sort,
    searchQuery,
    todayCount: counts.todayCount,
    weekCount: counts.weekCount,
    overdueCount: counts.overdueCount,
    setFilter,
    setSort,
    setSearchQuery,
    createProject,
    deleteProject,
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
  };
}
