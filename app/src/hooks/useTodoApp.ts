import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from '@/models/AppState';
import { TodoItem } from '@/models/TodoItem';
import { Project } from '@/models/Project';
import { Storage } from '@/services/Storage';
import { type FilterType, type SortType, Priority } from '@/types';

// Initialize with default data
const initializeDefaultData = (): AppState => {
  const state = new AppState();
  
  // Create default project
  const defaultProject = state.createProject('Mes Tâches');
  state.setCurrentProject(defaultProject.id);
  
  // Create sample todos
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

export function useTodoApp() {
  const [appState, setAppState] = useState<AppState>(() => {
    const loaded = Storage.load();
    return loaded || initializeDefaultData();
  });
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      Storage.save(appState);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [appState]);

  // Force save on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      Storage.save(appState);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState]);

  // Project actions
  const createProject = useCallback((name: string): Project => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const project = newState.createProject(name);
    setAppState(newState);
    return project;
  }, [appState]);

  const deleteProject = useCallback((projectId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    newState.deleteProject(projectId);
    setAppState(newState);
  }, [appState]);

  const setCurrentProject = useCallback((projectId: string | null): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = projectId;
    
    setAppState(newState);
  }, [appState]);

  const archiveProject = useCallback((projectId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const project = newState.getProject(projectId);
    if (project) {
      project.archive();
    }
    setAppState(newState);
  }, [appState]);

  const unarchiveProject = useCallback((projectId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const project = newState.getProject(projectId);
    if (project) {
      project.unarchive();
    }
    setAppState(newState);
  }, [appState]);

  // Todo actions
  const createTodo = useCallback((
    title: string,
    projectId: string,
    options?: {
      description?: string;
      dueDate?: Date | null;
      priority?: number;
      notes?: string;
    }
  ): TodoItem => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.createTodo(title, projectId, options);
    setAppState(newState);
    return todo;
  }, [appState]);

  const deleteTodo = useCallback((todoId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    newState.deleteTodo(todoId);
    setAppState(newState);
  }, [appState]);

  const updateTodo = useCallback((todoId: string, updates: Partial<{
    title: string;
    description: string;
    dueDate: Date | null;
    priority: number;
    notes: string;
    isComplete: boolean;
  }>): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.getTodo(todoId);
    if (todo) {
      if (updates.title !== undefined) todo.updateTitle(updates.title);
      if (updates.description !== undefined) todo.updateDescription(updates.description);
      if (updates.dueDate !== undefined) todo.updateDueDate(updates.dueDate);
      if (updates.priority !== undefined) todo.updatePriority(updates.priority);
      if (updates.notes !== undefined) todo.updateNotes(updates.notes);
      if (updates.isComplete !== undefined && todo.isComplete !== updates.isComplete) {
        todo.toggleComplete();
      }
    }
    setAppState(newState);
  }, [appState]);

  const toggleTodoComplete = useCallback((todoId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.getTodo(todoId);
    if (todo) {
      todo.toggleComplete();
    }
    setAppState(newState);
  }, [appState]);

  const moveTodoToProject = useCallback((todoId: string, newProjectId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    newState.moveTodoToProject(todoId, newProjectId);
    setAppState(newState);
  }, [appState]);

  // Checklist actions
  const addChecklistItem = useCallback((todoId: string, text: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.getTodo(todoId);
    if (todo) {
      todo.addChecklistItem(text);
    }
    setAppState(newState);
  }, [appState]);

  const toggleChecklistItem = useCallback((todoId: string, itemId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.getTodo(todoId);
    if (todo) {
      todo.toggleChecklistItem(itemId);
    }
    setAppState(newState);
  }, [appState]);

  const removeChecklistItem = useCallback((todoId: string, itemId: string): void => {
    const newState = new AppState();
    newState.projects = new Map(appState.projects);
    newState.allTodos = new Map(appState.allTodos);
    newState.currentProjectId = appState.currentProjectId;
    
    const todo = newState.getTodo(todoId);
    if (todo) {
      todo.removeChecklistItem(itemId);
    }
    setAppState(newState);
  }, [appState]);

  // Getters
  const currentProject = appState.getCurrentProject();
  const projects = appState.getActiveProjects();
  const archivedProjects = appState.getArchivedProjects();
  const filteredTodos = appState.getFilteredTodos(appState.currentProjectId, filter, sort);
  const todayCount = appState.getTodayCount();
  const weekCount = appState.getWeekCount();
  const overdueCount = appState.getOverdueCount();

  return {
    // State
    appState,
    currentProject,
    projects,
    archivedProjects,
    filteredTodos,
    filter,
    sort,
    todayCount,
    weekCount,
    overdueCount,
    
    // Setters
    setFilter,
    setSort,
    
    // Actions
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
