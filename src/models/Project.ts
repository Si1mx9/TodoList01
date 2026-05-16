import { v4 as uuidv4 } from 'uuid';
import { type ProjectData, PROJECT_COLORS } from '@/types';

export class Project {
  id: string;
  name: string;
  todoIds: string[];
  createdAt: Date;
  isArchived: boolean;
  color: string;

  constructor(
    name: string,
    options: {
      id?: string;
      todoIds?: string[];
      createdAt?: Date;
      isArchived?: boolean;
      color?: string;
    } = {}
  ) {
    this.id = options.id || uuidv4();
    this.name = name;
    this.todoIds = options.todoIds || [];
    this.createdAt = options.createdAt || new Date();
    this.isArchived = options.isArchived || false;
    this.color = options.color || this.getRandomColor();
  }

  private getRandomColor(): string {
    return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
  }

  addTodo(todoId: string): void {
    if (!this.todoIds.includes(todoId)) {
      this.todoIds.push(todoId);
    }
  }

  removeTodo(todoId: string): void {
    this.todoIds = this.todoIds.filter((id) => id !== todoId);
  }

  updateName(newName: string): void {
    this.name = newName;
  }

  archive(): void {
    this.isArchived = true;
  }

  unarchive(): void {
    this.isArchived = false;
  }

  getTodoCount(): number {
    return this.todoIds.length;
  }

  // Serialization
  toJSON(): ProjectData {
    return {
      id: this.id,
      name: this.name,
      todoIds: this.todoIds,
      createdAt: this.createdAt.toISOString(),
      isArchived: this.isArchived,
      color: this.color,
    };
  }

  // Deserialization
  static fromJSON(data: ProjectData): Project {
    return new Project(data.name, {
      id: data.id,
      todoIds: data.todoIds,
      createdAt: new Date(data.createdAt),
      isArchived: data.isArchived,
      color: data.color,
    });
  }
}
