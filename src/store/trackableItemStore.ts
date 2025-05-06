
import { create } from 'zustand';
import { useTaskStore, Task, TaskStatus, TaskPriority, TaskCategory } from './taskStore';
import { useHabitStore, Habit } from './habitStore';
import { toast } from 'sonner';
import { format, isPast, isToday } from 'date-fns';

// Unified TrackableItem type that can represent either a task or habit
export type TrackableItemType = 'task' | 'habit';

export interface TrackableItem {
  id: string;
  title: string; // title for tasks, name for habits
  type: TrackableItemType;
  status: string;
  category: string;
  isCompleted: boolean;
  dueDate?: string;
  icon?: string;
  // Properties needed for habits
  target?: number;
  current?: number;
  unit?: string;
  streak?: number;
  // Original references to access specific properties
  original: Task | Habit;
}

interface TrackableItemState {
  items: TrackableItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadAllItems: () => void;
  completeItem: (item: TrackableItem) => Promise<void>;
  skipItem: (item: TrackableItem) => Promise<void>;
  addTask: (taskData: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  addHabit: (habitData: Omit<Habit, 'id' | 'current' | 'streak'>) => Promise<void>;
  updateItem: (item: TrackableItem, updates: Partial<TrackableItem>) => Promise<void>;
  deleteItem: (item: TrackableItem) => Promise<void>;
}

export const useTrackableItemStore = create<TrackableItemState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  loadAllItems: () => {
    const taskStore = useTaskStore.getState();
    const habitStore = useHabitStore.getState();
    
    // Convert tasks to trackable items
    const taskItems: TrackableItem[] = taskStore.tasks.map(task => ({
      id: task.id,
      title: task.title,
      type: 'task',
      status: task.status,
      category: task.category,
      isCompleted: task.status === 'concluída',
      dueDate: task.due_date,
      original: task
    }));
    
    // Get current month's habits
    const currentMonthProgress = habitStore.monthlyProgress.find(
      p => p.month === habitStore.currentMonth
    );
    
    // Convert habits to trackable items
    const habitItems: TrackableItem[] = currentMonthProgress 
      ? currentMonthProgress.habits.map(habit => ({
        id: habit.id,
        title: habit.name,
        type: 'habit',
        status: habit.current >= habit.target ? 'concluída' : 'em progresso',
        category: 'Hábito',
        isCompleted: habit.current >= habit.target,
        target: habit.target,
        current: habit.current,
        unit: habit.unit,
        streak: habit.streak,
        original: habit
      }))
      : [];
    
    // Combine and sort by due date (most urgent first)
    const allItems = [...taskItems, ...habitItems].sort((a, b) => {
      // If both have due dates, sort by date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Tasks with due dates come before habits
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // Then sort alphabetically
      return a.title.localeCompare(b.title);
    });
    
    set({ items: allItems });
  },
  
  completeItem: async (item: TrackableItem) => {
    try {
      if (item.type === 'task') {
        // Handle task completion
        await useTaskStore.getState().updateTask(item.id, { status: 'concluída' });
        toast.success('Tarefa concluída!');
      } else if (item.type === 'habit') {
        // Handle habit completion
        const habitStore = useHabitStore.getState();
        const progressId = habitStore.monthlyProgress.find(
          p => p.month === habitStore.currentMonth
        )?.id;
        
        if (!progressId) {
          toast.error('Não foi possível encontrar o progresso atual');
          return;
        }
        
        const habit = item.original as Habit;
        const updatedHabit = {
          ...habit,
          current: habit.target, // Mark as complete by setting current to target
          streak: (habit.streak || 0) + 1
        };
        
        const currentProgress = habitStore.monthlyProgress.find(p => p.id === progressId);
        if (!currentProgress) return;
        
        const updatedHabits = currentProgress.habits.map(h => 
          h.id === habit.id ? updatedHabit : h
        );
        
        const newOverall = habitStore.monthlyProgress.find(
          p => p.id === progressId
        )?.overall || 0;
        
        await habitStore.updateHabitProgress(progressId, updatedHabits, newOverall);
        toast.success('Hábito concluído!');
      }
      
      // Reload items to reflect changes
      get().loadAllItems();
    } catch (error) {
      console.error('Error completing item:', error);
      toast.error('Erro ao concluir item');
    }
  },
  
  skipItem: async (item: TrackableItem) => {
    try {
      if (item.type === 'task') {
        // Mark task as cancelled
        await useTaskStore.getState().updateTask(item.id, { status: 'cancelada' });
        toast.success('Tarefa cancelada');
      } else if (item.type === 'habit') {
        // Reset habit streak
        const habitStore = useHabitStore.getState();
        const progressId = habitStore.monthlyProgress.find(
          p => p.month === habitStore.currentMonth
        )?.id;
        
        if (!progressId) {
          toast.error('Não foi possível encontrar o progresso atual');
          return;
        }
        
        const habit = item.original as Habit;
        const updatedHabit = {
          ...habit,
          streak: 0  // Reset streak on skip
        };
        
        const currentProgress = habitStore.monthlyProgress.find(p => p.id === progressId);
        if (!currentProgress) return;
        
        const updatedHabits = currentProgress.habits.map(h => 
          h.id === habit.id ? updatedHabit : h
        );
        
        const newOverall = habitStore.monthlyProgress.find(
          p => p.id === progressId
        )?.overall || 0;
        
        await habitStore.updateHabitProgress(progressId, updatedHabits, newOverall);
        toast.success('Hábito pulado');
      }
      
      // Reload items to reflect changes
      get().loadAllItems();
    } catch (error) {
      console.error('Error skipping item:', error);
      toast.error('Erro ao pular item');
    }
  },
  
  addTask: async (taskData) => {
    try {
      await useTaskStore.getState().addTask(taskData);
      toast.success('Tarefa adicionada!');
      get().loadAllItems();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  },
  
  addHabit: async (habitData) => {
    try {
      await useHabitStore.getState().addHabit(habitData);
      toast.success('Hábito adicionado!');
      get().loadAllItems();
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Erro ao adicionar hábito');
    }
  },
  
  updateItem: async (item, updates) => {
    try {
      if (item.type === 'task') {
        const taskStore = useTaskStore.getState();
        const taskUpdates: Partial<Task> = {};
        
        if (updates.title) taskUpdates.title = updates.title;
        if (updates.status) taskUpdates.status = updates.status as TaskStatus;
        if (updates.category) taskUpdates.category = updates.category as TaskCategory;
        if (updates.dueDate) taskUpdates.due_date = updates.dueDate;
        
        await taskStore.updateTask(item.id, taskUpdates);
        toast.success('Tarefa atualizada!');
      } else if (item.type === 'habit') {
        const habitStore = useHabitStore.getState();
        const habit = item.original as Habit;
        const progressId = habitStore.monthlyProgress.find(
          p => p.month === habitStore.currentMonth
        )?.id;
        
        if (!progressId) {
          toast.error('Não foi possível encontrar o progresso atual');
          return;
        }
        
        const currentProgress = habitStore.monthlyProgress.find(p => p.id === progressId);
        if (!currentProgress) return;
        
        const updatedHabit = { ...habit };
        
        if (updates.title) updatedHabit.name = updates.title;
        if (updates.target) updatedHabit.target = updates.target;
        if (updates.current) updatedHabit.current = updates.current;
        if (updates.unit) updatedHabit.unit = updates.unit;
        
        const updatedHabits = currentProgress.habits.map(h => 
          h.id === habit.id ? updatedHabit : h
        );
        
        const newOverall = habitStore.monthlyProgress.find(
          p => p.id === progressId
        )?.overall || 0;
        
        await habitStore.updateHabitProgress(progressId, updatedHabits, newOverall);
        toast.success('Hábito atualizado!');
      }
      
      get().loadAllItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    }
  },
  
  deleteItem: async (item) => {
    try {
      if (item.type === 'task') {
        await useTaskStore.getState().deleteTask(item.id);
        toast.success('Tarefa excluída!');
      } else if (item.type === 'habit') {
        const habitStore = useHabitStore.getState();
        const habit = item.original as Habit;
        
        // Find habit in current month's progress
        const currentMonth = habitStore.currentMonth;
        habitStore.removeHabit(currentMonth, (habit as any).name);
        
        toast.success('Hábito excluído!');
      }
      
      get().loadAllItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
    }
  }
}));
