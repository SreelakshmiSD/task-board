/**
 * Local Storage Service for Task Labels
 * Manages Trello-like color labels stored locally in the browser
 */

export interface TrelloLabel {
  id: string;
  name: string;
  emoji: string;
  color: string;
  textColor: string;
  priority: number;
  category: 'priority' | 'type' | 'status' | 'custom';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLabels {
  taskId: number;
  labels: string[]; // Array of label names
  updatedAt: string;
}

const LABELS_STORAGE_KEY = 'trello_labels';
const TASK_LABELS_STORAGE_KEY = 'task_labels';

// Default Trello-like labels
const DEFAULT_LABELS: TrelloLabel[] = [
  // Priority-based labels
  {
    id: 'critical',
    name: 'Critical',
    emoji: '',
    color: 'bg-red-700',
    textColor: 'text-white',
    priority: 5,
    category: 'priority',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high',
    name: 'High',
    emoji: '',
    color: 'bg-red-500',
    textColor: 'text-white',
    priority: 4,
    category: 'priority',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    emoji: '',
    color: 'bg-yellow-500',
    textColor: 'text-white',
    priority: 3,
    category: 'priority',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'low',
    name: 'Low',
    emoji: '',
    color: 'bg-green-500',
    textColor: 'text-white',
    priority: 2,
    category: 'priority',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Trello-style functional labels
  {
    id: 'meeting',
    name: 'Meeting',
    emoji: '',
    color: 'bg-red-500',
    textColor: 'text-white',
    priority: 4,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bug',
    name: 'Bug',
    emoji: '',
    color: 'bg-yellow-500',
    textColor: 'text-black',
    priority: 4,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feature',
    name: 'Feature',
    emoji: '',
    color: 'bg-green-500',
    textColor: 'text-white',
    priority: 3,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'review',
    name: 'Review',
    emoji: '',
    color: 'bg-blue-500',
    textColor: 'text-white',
    priority: 2,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'documentation',
    name: 'Documentation',
    emoji: '',
    color: 'bg-purple-500',
    textColor: 'text-white',
    priority: 2,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'testing',
    name: 'Testing',
    emoji: '',
    color: 'bg-orange-500',
    textColor: 'text-white',
    priority: 3,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'research',
    name: 'Research',
    emoji: '',
    color: 'bg-indigo-500',
    textColor: 'text-white',
    priority: 2,
    category: 'type',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'urgent',
    name: 'Urgent',
    emoji: '',
    color: 'bg-red-600',
    textColor: 'text-white',
    priority: 5,
    category: 'status',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class LabelStorageService {
  // Initialize default labels if not exists
  private initializeDefaultLabels(): void {
    if (typeof window === 'undefined') return;
    
    const existingLabels = this.getAllLabels();
    if (existingLabels.length === 0) {
      localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
    }
  }

  // Get all available labels
  getAllLabels(): TrelloLabel[] {
    if (typeof window === 'undefined') return [...DEFAULT_LABELS];

    try {
      const stored = localStorage.getItem(LABELS_STORAGE_KEY);
      if (!stored) {
        this.initializeDefaultLabels();
        return [...DEFAULT_LABELS];
      }
      const parsed = JSON.parse(stored);
      // Validate the parsed data structure
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid labels data structure');
      }
      return parsed;
    } catch (error) {
      // Silently handle errors and return default labels
      this.resetToDefaults();
      return [...DEFAULT_LABELS];
    }
  }

  // Reset to default labels (helper method)
  private resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
    } catch (error) {
      // If we can't even set localStorage, just continue silently
    }
  }

  // Get active labels only
  getActiveLabels(): TrelloLabel[] {
    return this.getAllLabels().filter(label => label.isActive);
  }

  // Get labels by category
  getLabelsByCategory(category: TrelloLabel['category']): TrelloLabel[] {
    return this.getActiveLabels().filter(label => label.category === category);
  }

  // Add or update a label
  saveLabel(label: Omit<TrelloLabel, 'createdAt' | 'updatedAt'>): TrelloLabel {
    if (typeof window === 'undefined') return label as TrelloLabel;
    
    const labels = this.getAllLabels();
    const existingIndex = labels.findIndex(l => l.id === label.id);
    
    const now = new Date().toISOString();
    const updatedLabel: TrelloLabel = {
      ...label,
      createdAt: existingIndex >= 0 ? labels[existingIndex].createdAt : now,
      updatedAt: now,
    };
    
    if (existingIndex >= 0) {
      labels[existingIndex] = updatedLabel;
    } else {
      labels.push(updatedLabel);
    }
    
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels));
    return updatedLabel;
  }

  // Delete a label
  deleteLabel(labelId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const labels = this.getAllLabels();
    const filteredLabels = labels.filter(l => l.id !== labelId);
    
    if (filteredLabels.length !== labels.length) {
      localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(filteredLabels));
      return true;
    }
    return false;
  }

  // Get task labels
  getTaskLabels(taskId: number): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(TASK_LABELS_STORAGE_KEY);
      if (!stored) return [];

      const taskLabelsMap: Record<string, TaskLabels> = JSON.parse(stored);
      const labels = taskLabelsMap[taskId.toString()]?.labels;
      return Array.isArray(labels) ? labels : [];
    } catch (error) {
      // Silently handle errors and return empty array
      return [];
    }
  }

  // Save task labels
  saveTaskLabels(taskId: number, labels: string[]): void {
    if (typeof window === 'undefined') return;
    if (!Array.isArray(labels)) return;

    try {
      const stored = localStorage.getItem(TASK_LABELS_STORAGE_KEY);
      let taskLabelsMap: Record<string, TaskLabels> = {};

      if (stored) {
        const parsed = JSON.parse(stored);
        taskLabelsMap = typeof parsed === 'object' && parsed !== null ? parsed : {};
      }

      taskLabelsMap[taskId.toString()] = {
        taskId,
        labels: [...labels], // Create a copy to avoid reference issues
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(TASK_LABELS_STORAGE_KEY, JSON.stringify(taskLabelsMap));
    } catch (error) {
      // Silently handle errors - localStorage might be full or disabled
    }
  }

  // Remove task labels
  removeTaskLabels(taskId: number): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(TASK_LABELS_STORAGE_KEY);
      if (!stored) return;
      
      const taskLabelsMap: Record<string, TaskLabels> = JSON.parse(stored);
      delete taskLabelsMap[taskId.toString()];
      
      localStorage.setItem(TASK_LABELS_STORAGE_KEY, JSON.stringify(taskLabelsMap));
    } catch (error) {
      console.error('Error removing task labels from localStorage:', error);
    }
  }

  // Get all task labels (for export/backup)
  getAllTaskLabels(): Record<string, TaskLabels> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(TASK_LABELS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading all task labels from localStorage:', error);
      return {};
    }
  }

  // Clear all data (for reset)
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(LABELS_STORAGE_KEY);
    localStorage.removeItem(TASK_LABELS_STORAGE_KEY);
    this.initializeDefaultLabels();
  }
}

// Export singleton instance
export const labelStorageService = new LabelStorageService();
