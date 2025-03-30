
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskPriority = 'baixa' | 'média' | 'alta';
export type TaskStatus = 'pendente' | 'em progresso' | 'concluída';
export type TaskCategory = 'Financeiro' | 'Trabalho' | 'Pessoal' | 'Saúde' | 'Outro';

export interface Task {
  id: string;
  user_id: string;
  title: string;
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
  
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
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
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      
      updateTask: (id, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
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
