import { v4 as uuidv4 } from 'uuid';
import { Priority, type ChecklistItem, type TodoItemData } from '@/types';

export class TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: number;
  projectId: string;
  isComplete: boolean;
  notes: string;
  checklist: ChecklistItem[];
  createdAt: Date;

  constructor(
    title: string,
    projectId: string,
    options: {
      id?: string;
      description?: string;
      dueDate?: Date | null;
      priority?: number;
      isComplete?: boolean;
      notes?: string;
      checklist?: ChecklistItem[];
      createdAt?: Date;
    } = {}
  ) {
    this.id = options.id || uuidv4();
    this.title = title;
    this.projectId = projectId;
    this.description = options.description || '';
    this.dueDate = options.dueDate || null;
    this.priority = options.priority || Priority.MEDIUM;
    this.isComplete = options.isComplete || false;
    this.notes = options.notes || '';
    this.checklist = options.checklist || [];
    this.createdAt = options.createdAt || new Date();
  }

  toggleComplete(): void {
    this.isComplete = !this.isComplete;
  }

  updatePriority(newPriority: number): void {
    this.priority = newPriority;
  }

  updateDueDate(newDate: Date | null): void {
    this.dueDate = newDate;
  }

  updateTitle(newTitle: string): void {
    this.title = newTitle;
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription;
  }

  updateNotes(newNotes: string): void {
    this.notes = newNotes;
  }

  addChecklistItem(text: string): void {
    this.checklist.push({
      id: uuidv4(),
      text,
      isChecked: false,
    });
  }

  toggleChecklistItem(itemId: string): void {
    const item = this.checklist.find((item) => item.id === itemId);
    if (item) {
      item.isChecked = !item.isChecked;
    }
  }

  removeChecklistItem(itemId: string): void {
    this.checklist = this.checklist.filter((item) => item.id !== itemId);
  }

  moveToProject(newProjectId: string): void {
    this.projectId = newProjectId;
  }

  // Serialization
  toJSON(): TodoItemData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      priority: this.priority,
      projectId: this.projectId,
      isComplete: this.isComplete,
      notes: this.notes,
      checklist: this.checklist,
      createdAt: this.createdAt.toISOString(),
    };
  }

  // Deserialization
  static fromJSON(data: TodoItemData): TodoItem {
    return new TodoItem(data.title, data.projectId, {
      id: data.id,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      isComplete: data.isComplete,
      notes: data.notes,
      checklist: data.checklist,
      createdAt: new Date(data.createdAt),
    });
  }
}
