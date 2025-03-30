
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HabitProgress {
  name: string;
  progress: number;
  target: number;
}

export interface MonthlyProgress {
  id: string;
  user_id: string;
  month: string;
  habits: HabitProgress[];
  overall: number;
}

interface HabitState {
  monthlyProgress: MonthlyProgress[];
  currentMonth: MonthlyProgress | null;
  loading: boolean;
  error: string | null;
  
  addHabit: (month: string, habit: Omit<HabitProgress, 'progress'>) => void;
  updateHabitProgress: (month: string, habitName: string, progress: number) => void;
  removeHabit: (month: string, habitName: string) => void;
  setCurrentMonth: (month: string) => void;
  createMonthlyProgress: (month: string, userId: string) => void;
  setMonthlyProgress: (progress: MonthlyProgress[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const calculateOverallProgress = (habits: HabitProgress[]): number => {
  if (habits.length === 0) return 0;
  
  const total = habits.reduce((sum, habit) => {
    const percentage = (habit.progress / habit.target) * 100;
    return sum + percentage;
  }, 0);
  
  return Math.round((total / habits.length) * 10) / 10; // Round to 1 decimal place
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      monthlyProgress: [],
      currentMonth: null,
      loading: false,
      error: null,
      
      createMonthlyProgress: (month, userId) => {
        const exists = get().monthlyProgress.some(p => p.month === month);
        
        if (!exists) {
          const newProgress: MonthlyProgress = {
            id: crypto.randomUUID(),
            user_id: userId,
            month,
            habits: [],
            overall: 0,
          };
          
          set((state) => ({
            monthlyProgress: [...state.monthlyProgress, newProgress],
            currentMonth: newProgress,
          }));
        }
      },
      
      setCurrentMonth: (month) => {
        const currentMonth = get().monthlyProgress.find(p => p.month === month) || null;
        set({ currentMonth });
      },
      
      addHabit: (month, habit) => {
        set((state) => {
          const updatedProgress = state.monthlyProgress.map((progress) => {
            if (progress.month === month) {
              // Check if habit already exists
              const habitExists = progress.habits.some(h => h.name === habit.name);
              if (habitExists) return progress;
              
              const updatedHabits = [
                ...progress.habits,
                { ...habit, progress: 0 },
              ];
              
              return {
                ...progress,
                habits: updatedHabits,
                overall: calculateOverallProgress(updatedHabits),
              };
            }
            return progress;
          });
          
          // Update current month if it's the one being modified
          const newCurrentMonth = state.currentMonth?.month === month
            ? updatedProgress.find(p => p.month === month) || state.currentMonth
            : state.currentMonth;
          
          return {
            monthlyProgress: updatedProgress,
            currentMonth: newCurrentMonth,
          };
        });
      },
      
      updateHabitProgress: (month, habitName, progress) => {
        set((state) => {
          const updatedProgress = state.monthlyProgress.map((monthProgress) => {
            if (monthProgress.month === month) {
              const updatedHabits = monthProgress.habits.map((habit) =>
                habit.name === habitName
                  ? { ...habit, progress: Math.min(progress, habit.target) }
                  : habit
              );
              
              return {
                ...monthProgress,
                habits: updatedHabits,
                overall: calculateOverallProgress(updatedHabits),
              };
            }
            return monthProgress;
          });
          
          // Update current month if it's the one being modified
          const newCurrentMonth = state.currentMonth?.month === month
            ? updatedProgress.find(p => p.month === month) || state.currentMonth
            : state.currentMonth;
          
          return {
            monthlyProgress: updatedProgress,
            currentMonth: newCurrentMonth,
          };
        });
      },
      
      removeHabit: (month, habitName) => {
        set((state) => {
          const updatedProgress = state.monthlyProgress.map((progress) => {
            if (progress.month === month) {
              const updatedHabits = progress.habits.filter(h => h.name !== habitName);
              
              return {
                ...progress,
                habits: updatedHabits,
                overall: calculateOverallProgress(updatedHabits),
              };
            }
            return progress;
          });
          
          // Update current month if it's the one being modified
          const newCurrentMonth = state.currentMonth?.month === month
            ? updatedProgress.find(p => p.month === month) || state.currentMonth
            : state.currentMonth;
          
          return {
            monthlyProgress: updatedProgress,
            currentMonth: newCurrentMonth,
          };
        });
      },
      
      setMonthlyProgress: (progress) => {
        set({ monthlyProgress: progress });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'habits-storage',
    }
  )
);
