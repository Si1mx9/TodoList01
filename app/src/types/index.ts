// Types and Enums for the Todo Application

export const Priority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type PriorityType = typeof Priority[keyof typeof Priority];

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface TodoItemData {
  id: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO string for serialization
  priority: number;
  projectId: string;
  isComplete: boolean;
  notes: string;
  checklist: ChecklistItem[];
  createdAt: string; // ISO string
}

export interface ProjectData {
  id: string;
  name: string;
  todoIds: string[];
  createdAt: string; // ISO string
  isArchived: boolean;
  color: string;
}

export interface AppStateData {
  projects: ProjectData[];
  allTodos: TodoItemData[];
  currentProjectId: string | null;
}

export type FilterType = 'all' | 'today' | 'week' | 'overdue' | 'completed' | 'uncompleted';
export type SortType = 'date' | 'priority' | 'created' | 'title';

export const PRIORITY_COLORS: Record<number, string> = {
  [Priority.LOW]: 'bg-emerald-500',
  [Priority.MEDIUM]: 'bg-amber-500',
  [Priority.HIGH]: 'bg-rose-500',
};

export const PRIORITY_LABELS: Record<number, string> = {
  [Priority.LOW]: 'Basse',
  [Priority.MEDIUM]: 'Moyenne',
  [Priority.HIGH]: 'Haute',
};

export const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ef4444', // red
];
