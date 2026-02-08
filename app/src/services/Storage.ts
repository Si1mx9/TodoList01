import { AppState } from '@/models/AppState';
import { type AppStateData } from '@/types';

const STORAGE_KEY = 'todoAppData_v1';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const Storage = {
  save(state: AppState): void {
    try {
      const data = state.toJSON();
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new StorageError('Le stockage local est plein. Veuillez supprimer des données.');
      }
      throw new StorageError('Erreur lors de la sauvegarde des données');
    }
  },

  load(): AppState | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;

      const parsed: AppStateData = JSON.parse(serialized);
      return AppState.fromJSON(parsed);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // If data is corrupted, clear it and start fresh
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  export(): string {
    const serialized = localStorage.getItem(STORAGE_KEY);
    return serialized || '{}';
  },

  import(jsonString: string): boolean {
    try {
      const parsed: AppStateData = JSON.parse(jsonString);
      // Validate structure
      if (!parsed.projects || !parsed.allTodos) {
        throw new Error('Invalid data structure');
      }
      localStorage.setItem(STORAGE_KEY, jsonString);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  },
};
