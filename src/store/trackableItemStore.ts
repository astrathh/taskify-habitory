
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { TaskPriority, TaskStatus, Task } from '@/store/taskStore';
import { Habit } from '@/store/habitStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Define the unified trackable item type
export type TrackableType = 'task' | 'habit';

export interface TrackableItem {
  id: string;
  type: TrackableType;
  name: string;
  status: TaskStatus | 'in_progress' | 'completed' | 'skipped';
  priority?: TaskPriority;
  dueDate?: string;
  createdAt: string;
  category?: string;
  streak?: number;
  target?: number;
  current?: number;
  unit?: string;
  recurring: boolean;
  description?: string;
}

interface TrackableItemState {
  items: TrackableItem[];
  loading: boolean;
  error: string | null;
  
  // Functions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<TrackableItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<TrackableItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  completeItem: (id: string) => Promise<void>;
  skipItem: (id: string) => Promise<void>;
  syncWithTasksAndHabits: () => Promise<void>;
}

// Helper to convert Task to TrackableItem
const taskToTrackable = (task: Task): TrackableItem => ({
  id: task.id,
  type: 'task',
  name: task.title,
  status: task.status,
  priority: task.priority,
  dueDate: task.due_date,
  createdAt: task.created_at,
  category: task.category,
  description: task.description,
  recurring: false
});

// Helper to convert Habit to TrackableItem
const habitToTrackable = (habit: Habit): TrackableItem => ({
  id: habit.id,
  type: 'habit',
  name: habit.name,
  status: habit.current >= habit.target ? 'completed' : 'in_progress',
  createdAt: new Date().toISOString(),
  streak: habit.streak,
  target: habit.target,
  current: habit.current,
  unit: habit.unit,
  recurring: true
});

export const useTrackableItemStore = create<TrackableItemState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      
      fetchItems: async () => {
        set({ loading: true, error: null });
        try {
          // First get tasks
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (taskError) throw taskError;
          
          // Get habits from current month
          const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
          const { data: progressData, error: progressError } = await supabase
            .from('progress')
            .select('*')
            .eq('month', currentMonth);
            
          if (progressError) throw progressError;
          
          // Convert tasks to trackable items
          const taskItems = (taskData as unknown as Task[]).map(taskToTrackable);
          
          // Convert habits to trackable items
          let habitItems: TrackableItem[] = [];
          if (progressData && progressData.length > 0) {
            const habits = progressData[0].habits as unknown as Habit[];
            habitItems = habits.map(habitToTrackable);
          }
          
          // Combine both types of items
          const allItems = [...taskItems, ...habitItems];
          
          set({ items: allItems, loading: false });
        } catch (error) {
          console.error('Error fetching trackable items:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      addItem: async (item) => {
        set({ loading: true, error: null });
        try {
          if (item.type === 'task') {
            // Add as a task
            const taskData = {
              title: item.name,
              status: item.status as TaskStatus,
              priority: item.priority || 'média',
              due_date: item.dueDate || new Date().toISOString(),
              category: item.category || 'Outro',
              description: item.description || ''
            };
            
            const { data, error } = await supabase
              .from('tasks')
              .insert([taskData])
              .select()
              .single();
              
            if (error) throw error;
            
            // Add the new task to the items list
            const newItem = taskToTrackable(data as unknown as Task);
            set((state) => ({
              items: [...state.items, newItem],
              loading: false
            }));
          } else if (item.type === 'habit') {
            // Add as a habit
            const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
            const { data: progressData } = await supabase
              .from('progress')
              .select('*')
              .eq('month', currentMonth)
              .single();
              
            if (progressData) {
              const habits = progressData.habits as unknown as Habit[] || [];
              const newHabit: Habit = {
                id: crypto.randomUUID(),
                name: item.name,
                target: item.target || 1,
                current: item.current || 0,
                unit: item.unit || 'vezes',
                streak: 0
              };
              
              const updatedHabits = [...habits, newHabit];
              
              // Calculate overall progress
              const totalProgress = updatedHabits.reduce((acc, h) => {
                const habitProgress = Math.min((h.current / h.target) * 100, 100);
                return acc + habitProgress;
              }, 0);
              
              const newOverall = Math.round(totalProgress / (updatedHabits.length || 1));
              
              // Update progress
              await supabase
                .from('progress')
                .update({
                  habits: updatedHabits as unknown as Json,
                  overall: newOverall
                })
                .eq('id', progressData.id);
                
              // Add the new habit to the items list
              const newItem = habitToTrackable(newHabit);
              set((state) => ({
                items: [...state.items, newItem],
                loading: false
              }));
            }
          }
        } catch (error) {
          console.error('Error adding trackable item:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateItem: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const item = get().items.find(i => i.id === id);
          if (!item) throw new Error('Item not found');
          
          if (item.type === 'task') {
            // Update as task
            const taskUpdates: Partial<Task> = {};
            if (updates.name !== undefined) taskUpdates.title = updates.name;
            if (updates.status !== undefined) taskUpdates.status = updates.status as TaskStatus;
            if (updates.priority !== undefined) taskUpdates.priority = updates.priority;
            if (updates.dueDate !== undefined) taskUpdates.due_date = updates.dueDate;
            if (updates.description !== undefined) taskUpdates.description = updates.description;
            if (updates.category !== undefined) taskUpdates.category = updates.category as any;
            
            const { error } = await supabase
              .from('tasks')
              .update(taskUpdates)
              .eq('id', id);
              
            if (error) throw error;
          } else if (item.type === 'habit') {
            // Update as habit
            const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
            const { data: progressData } = await supabase
              .from('progress')
              .select('*')
              .eq('month', currentMonth)
              .single();
              
            if (progressData) {
              const habits = progressData.habits as unknown as Habit[] || [];
              const updatedHabits = habits.map(h => {
                if (h.id === id) {
                  return {
                    ...h,
                    name: updates.name ?? h.name,
                    current: updates.current ?? h.current,
                    target: updates.target ?? h.target,
                    unit: updates.unit ?? h.unit,
                    streak: updates.streak ?? h.streak
                  };
                }
                return h;
              });
              
              // Calculate overall progress
              const totalProgress = updatedHabits.reduce((acc, h) => {
                const habitProgress = Math.min((h.current / h.target) * 100, 100);
                return acc + habitProgress;
              }, 0);
              
              const newOverall = Math.round(totalProgress / (updatedHabits.length || 1));
              
              // Update progress
              await supabase
                .from('progress')
                .update({
                  habits: updatedHabits as unknown as Json,
                  overall: newOverall
                })
                .eq('id', progressData.id);
            }
          }
          
          // Update the item in local state
          set((state) => ({
            items: state.items.map(i => i.id === id ? { ...i, ...updates } : i),
            loading: false
          }));
          
        } catch (error) {
          console.error('Error updating trackable item:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      deleteItem: async (id) => {
        set({ loading: true, error: null });
        try {
          const item = get().items.find(i => i.id === id);
          if (!item) throw new Error('Item not found');
          
          if (item.type === 'task') {
            // Delete task
            const { error } = await supabase
              .from('tasks')
              .delete()
              .eq('id', id);
              
            if (error) throw error;
          } else if (item.type === 'habit') {
            // Delete habit from monthly progress
            const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
            const { data: progressData } = await supabase
              .from('progress')
              .select('*')
              .eq('month', currentMonth)
              .single();
              
            if (progressData) {
              const habits = progressData.habits as unknown as Habit[] || [];
              const updatedHabits = habits.filter(h => h.id !== id);
              
              // Calculate overall progress
              const totalProgress = updatedHabits.reduce((acc, h) => {
                const habitProgress = Math.min((h.current / h.target) * 100, 100);
                return acc + habitProgress;
              }, 0);
              
              const newOverall = Math.round(totalProgress / (updatedHabits.length || 1));
              
              // Update progress
              await supabase
                .from('progress')
                .update({
                  habits: updatedHabits as unknown as Json,
                  overall: newOverall
                })
                .eq('id', progressData.id);
            }
          }
          
          // Remove the item from local state
          set((state) => ({
            items: state.items.filter(i => i.id !== id),
            loading: false
          }));
          
        } catch (error) {
          console.error('Error deleting trackable item:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      completeItem: async (id) => {
        try {
          const item = get().items.find(i => i.id === id);
          if (!item) throw new Error('Item not found');
          
          if (item.type === 'task') {
            await get().updateItem(id, { status: 'concluída' });
            toast.success('Tarefa concluída com sucesso!');
          } else if (item.type === 'habit') {
            // Increment habit progress to completion
            const updatedCurrent = item.target || 1;
            const updatedStreak = (item.streak || 0) + 1;
            await get().updateItem(id, { 
              current: updatedCurrent,
              streak: updatedStreak,
              status: 'completed' 
            });
            toast.success(`Hábito concluído! Sequência: ${updatedStreak} dias`);
          }
        } catch (error) {
          console.error('Error completing item:', error);
          toast.error('Erro ao concluir item');
        }
      },
      
      skipItem: async (id) => {
        try {
          const item = get().items.find(i => i.id === id);
          if (!item) throw new Error('Item not found');
          
          if (item.type === 'task') {
            await get().updateItem(id, { status: 'cancelada' });
            toast.info('Tarefa cancelada');
          } else if (item.type === 'habit') {
            // Reset streak for skipped habits
            await get().updateItem(id, { 
              streak: 0,
              status: 'skipped' 
            });
            toast.info('Hábito pulado. Sequência reiniciada.');
          }
        } catch (error) {
          console.error('Error skipping item:', error);
          toast.error('Erro ao pular item');
        }
      },
      
      syncWithTasksAndHabits: async () => {
        // This function will be implemented to sync with the existing stores
        // when we need to maintain backward compatibility
        set({ loading: true });
        try {
          await get().fetchItems();
          set({ loading: false });
        } catch (error) {
          console.error('Error syncing items:', error);
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: 'trackable-items-storage',
    }
  )
);
