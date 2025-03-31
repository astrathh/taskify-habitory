
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export type TaskPriority = 'baixa' | 'média' | 'alta';
export type TaskStatus = 'pendente' | 'em progresso' | 'concluída' | 'cancelada';
export type TaskCategory = 'Financeiro' | 'Trabalho' | 'Pessoal' | 'Saúde' | 'Outro';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string; // Campo adicionado para descrição
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      
      addTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();
          
          if (error) throw error;
          
          // Cast the data to the correct type
          const typedTask = data as unknown as Task;
          
          set((state) => ({
            tasks: [...state.tasks, typedTask],
            loading: false,
          }));
        } catch (error) {
          console.error('Error adding task:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateTask: async (id, updatedTask) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .update(updatedTask)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Cast the data to the correct type
          const typedTask = data as unknown as Task;
          
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...typedTask } : task
            ),
            loading: false,
          }));
        } catch (error) {
          console.error('Error updating task:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            loading: false,
          }));
        } catch (error) {
          console.error('Error deleting task:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Cast the data to the correct type
          const typedTasks = (data || []) as unknown as Task[];
          
          set({ tasks: typedTasks, loading: false });
        } catch (error) {
          console.error('Error fetching tasks:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      setTasks: (tasks) => {
        set({ tasks });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'tasks-storage',
    }
  )
);
