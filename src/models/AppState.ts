import { TodoItem } from './TodoItem';
import { Project } from './Project';
import { type AppStateData, type FilterType, type SortType } from '@/types';
import { isToday, isThisWeek, isPast, startOfDay } from 'date-fns';

export class AppState {
  projects: Map<string, Project>;
  allTodos: Map<string, TodoItem>;
  currentProjectId: string | null;

  constructor() {
    this.projects = new Map();
    this.allTodos = new Map();
    this.currentProjectId = null;
  }

  // Project Management
  createProject(name: string): Project {
    const project = new Project(name);
    this.projects.set(project.id, project);
    return project;
  }

  deleteProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      // Delete all associated todos
      project.todoIds.forEach((todoId) => {
        this.allTodos.delete(todoId);
      });
      this.projects.delete(projectId);
      if (this.currentProjectId === projectId) {
        this.currentProjectId = null;
      }
    }
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getActiveProjects(): Project[] {
    return this.getAllProjects().filter((p) => !p.isArchived);
  }

  getArchivedProjects(): Project[] {
    return this.getAllProjects().filter((p) => p.isArchived);
  }

  setCurrentProject(projectId: string | null): void {
    this.currentProjectId = projectId;
  }

  getCurrentProject(): Project | undefined {
    return this.currentProjectId ? this.projects.get(this.currentProjectId) : undefined;
  }

  // Todo Management
  createTodo(
    title: string,
    projectId: string,
    options: {
      description?: string;
      dueDate?: Date | null;
      priority?: number;
      notes?: string;
    } = {}
  ): TodoItem {
    const todo = new TodoItem(title, projectId, options);
    this.allTodos.set(todo.id, todo);
    
    const project = this.projects.get(projectId);
    if (project) {
      project.addTodo(todo.id);
    }
    
    return todo;
  }

  deleteTodo(todoId: string): void {
    const todo = this.allTodos.get(todoId);
    if (todo) {
      const project = this.projects.get(todo.projectId);
      if (project) {
        project.removeTodo(todoId);
      }
      this.allTodos.delete(todoId);
    }
  }

  getTodo(todoId: string): TodoItem | undefined {
    return this.allTodos.get(todoId);
  }

  getTodosForProject(projectId: string): TodoItem[] {
    const project = this.projects.get(projectId);
    if (!project) return [];
    
    return project.todoIds
      .map((id) => this.allTodos.get(id))
      .filter((todo): todo is TodoItem => todo !== undefined);
  }

  getAllTodos(): TodoItem[] {
    return Array.from(this.allTodos.values());
  }

  moveTodoToProject(todoId: string, newProjectId: string): void {
    const todo = this.allTodos.get(todoId);
    if (!todo) return;

    const oldProject = this.projects.get(todo.projectId);
    const newProject = this.projects.get(newProjectId);

    if (oldProject) {
      oldProject.removeTodo(todoId);
    }
    if (newProject) {
      newProject.addTodo(todoId);
      todo.moveToProject(newProjectId);
    }
  }

  // Filtering and Sorting
  getFilteredTodos(
    projectId: string | null,
    filter: FilterType,
    sort: SortType = 'date'
  ): TodoItem[] {
    let todos: TodoItem[];

    if (projectId) {
      todos = this.getTodosForProject(projectId);
    } else {
      todos = this.getAllTodos();
    }

    // Apply filter
    switch (filter) {
      case 'today':
        todos = todos.filter((t) => t.dueDate && isToday(t.dueDate));
        break;
      case 'week':
        todos = todos.filter((t) => t.dueDate && isThisWeek(t.dueDate));
        break;
      case 'overdue':
        todos = todos.filter(
          (t) => t.dueDate && isPast(startOfDay(t.dueDate)) && !t.isComplete
        );
        break;
      case 'completed':
        todos = todos.filter((t) => t.isComplete);
        break;
      case 'uncompleted':
        todos = todos.filter((t) => !t.isComplete);
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Apply sort
    todos.sort((a, b) => {
      switch (sort) {
        case 'date':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          return b.priority - a.priority;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return todos;
  }

  getUncompletedCount(projectId: string): number {
    return this.getTodosForProject(projectId).filter((t) => !t.isComplete).length;
  }

  getTodayCount(): number {
    return this.getAllTodos().filter(
      (t) => t.dueDate && isToday(t.dueDate) && !t.isComplete
    ).length;
  }

  getWeekCount(): number {
    return this.getAllTodos().filter(
      (t) => t.dueDate && isThisWeek(t.dueDate) && !t.isComplete
    ).length;
  }

  getOverdueCount(): number {
    return this.getAllTodos().filter(
      (t) => t.dueDate && isPast(startOfDay(t.dueDate)) && !t.isComplete
    ).length;
  }

  // Serialization
  toJSON(): AppStateData {
    return {
      projects: this.getAllProjects().map((p) => p.toJSON()),
      allTodos: this.getAllTodos().map((t) => t.toJSON()),
      currentProjectId: this.currentProjectId,
    };
  }

  // Deserialization
  static fromJSON(data: AppStateData): AppState {
    const state = new AppState();
    
    // Restore projects first
    data.projects.forEach((projectData) => {
      const project = Project.fromJSON(projectData);
      state.projects.set(project.id, project);
    });

    // Restore todos
    data.allTodos.forEach((todoData) => {
      const todo = TodoItem.fromJSON(todoData);
      state.allTodos.set(todo.id, todo);
    });

    state.currentProjectId = data.currentProjectId;
    
    return state;
  }
}
