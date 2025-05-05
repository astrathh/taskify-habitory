
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTaskStore, TaskStatus, TaskPriority } from './taskStore';
import { useHabitStore } from './habitStore';

export type TrackableType = 'task' | 'habit';

export interface TrackableItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: TrackableType;
  status: string;
  priority?: TaskPriority;
  dueDate?: string;
  category?: string;
  createdAt: string;
  completedAt?: string;
  skippedAt?: string;
  recurringDays?: number[];
}

interface TrackableItemState {
  items: TrackableItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  completeItem: (id: string) => Promise<void>;
  skipItem: (id: string) => Promise<void>;
  addItem: (item: Omit<TrackableItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<TrackableItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useTrackableItemStore = create<TrackableItemState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    const taskStore = useTaskStore.getState();
    const habitStore = useHabitStore.getState();

    set({ loading: true, error: null });

    try {
      // Fetch tasks
      await taskStore.fetchTasks();
      const tasks = taskStore.tasks;

      // Fetch habits
      await habitStore.fetchHabits();
      const habits = habitStore.habits;

      // Map tasks to TrackableItem format
      const trackableTasks: TrackableItem[] = tasks.map(task => ({
        id: task.id,
        user_id: task.user_id,
        name: task.title,
        description: task.description,
        type: 'task',
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        category: task.category,
        createdAt: task.created_at,
        completedAt: task.status === 'concluída' ? task.updated_at : undefined,
        skippedAt: task.status === 'cancelada' ? task.updated_at : undefined
      }));

      // Map habits to TrackableItem format
      const trackableHabits: TrackableItem[] = habits.map(habit => ({
        id: habit.id,
        user_id: habit.user_id,
        name: habit.name,
        description: habit.description,
        type: 'habit',
        status: habit.status,
        category: habit.category,
        createdAt: habit.created_at,
        completedAt: habit.last_completed,
        skippedAt: habit.last_skipped,
        recurringDays: habit.recurring_days
      }));

      // Combine and sort all items
      const allItems = [...trackableTasks, ...trackableHabits].sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });

      set({ items: allItems, loading: false });
    } catch (error) {
      console.error('Error fetching trackable items:', error);
      set({ error: 'Failed to load items', loading: false });
      toast.error('Failed to load tasks and habits');
    }
  },

  completeItem: async (id: string) => {
    try {
      const item = get().items.find(item => item.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.type === 'task') {
        await useTaskStore.getState().updateTask(id, { status: 'concluída' });
      } else if (item.type === 'habit') {
        await useHabitStore.getState().completeHabit(id);
      }

      await get().fetchItems();
      toast.success(`${item.type === 'task' ? 'Task' : 'Habit'} completed!`);
    } catch (error) {
      console.error('Error completing item:', error);
      toast.error('Failed to complete item');
    }
  },

  skipItem: async (id: string) => {
    try {
      const item = get().items.find(item => item.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.type === 'task') {
        await useTaskStore.getState().updateTask(id, { status: 'cancelada' });
      } else if (item.type === 'habit') {
        await useHabitStore.getState().skipHabit(id);
      }

      await get().fetchItems();
      toast.success(`${item.type === 'task' ? 'Task' : 'Habit'} skipped`);
    } catch (error) {
      console.error('Error skipping item:', error);
      toast.error('Failed to skip item');
    }
  },

  addItem: async (item) => {
    try {
      if (item.type === 'task') {
        // Convert trackable item to task format
        const taskData = {
          title: item.name,
          description: item.description || '',
          status: item.status as TaskStatus,
          priority: item.priority as TaskPriority,
          due_date: item.dueDate || new Date().toISOString(),
          category: item.category || 'General',
          user_id: item.user_id
        };
        
        await useTaskStore.getState().addTask(taskData);
      } else if (item.type === 'habit') {
        // Convert trackable item to habit format
        const habitData = {
          name: item.name,
          description: item.description || '',
          category: item.category || 'General',
          status: 'active',
          recurring_days: item.recurringDays || [1, 2, 3, 4, 5],
          user_id: item.user_id
        };
        
        await useHabitStore.getState().addHabit(habitData);
      }

      await get().fetchItems();
      toast.success(`${item.type === 'task' ? 'Task' : 'Habit'} added successfully!`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  },

  updateItem: async (id, updates) => {
    try {
      const item = get().items.find(item => item.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.type === 'task') {
        // Convert trackable updates to task format
        const taskUpdates: any = {};
        if (updates.name) taskUpdates.title = updates.name;
        if (updates.description) taskUpdates.description = updates.description;
        if (updates.status) taskUpdates.status = updates.status;
        if (updates.priority) taskUpdates.priority = updates.priority;
        if (updates.dueDate) taskUpdates.due_date = updates.dueDate;
        if (updates.category) taskUpdates.category = updates.category;
        
        await useTaskStore.getState().updateTask(id, taskUpdates);
      } else if (item.type === 'habit') {
        // Convert trackable updates to habit format
        const habitUpdates: any = {};
        if (updates.name) habitUpdates.name = updates.name;
        if (updates.description) habitUpdates.description = updates.description;
        if (updates.category) habitUpdates.category = updates.category;
        if (updates.recurringDays) habitUpdates.recurring_days = updates.recurringDays;
        
        await useHabitStore.getState().updateHabit(id, habitUpdates);
      }

      await get().fetchItems();
      toast.success(`${item.type === 'task' ? 'Task' : 'Habit'} updated successfully!`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  },

  deleteItem: async (id: string) => {
    try {
      const item = get().items.find(item => item.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.type === 'task') {
        await useTaskStore.getState().deleteTask(id);
      } else if (item.type === 'habit') {
        await useHabitStore.getState().deleteHabit(id);
      }

      await get().fetchItems();
      toast.success(`${item.type === 'task' ? 'Task' : 'Habit'} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  },
}));
