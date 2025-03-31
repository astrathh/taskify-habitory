
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Habit {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  streak: number;
}

export interface MonthlyProgress {
  id: string;
  user_id: string;
  month: string;
  habits: Habit[];
  overall: number;
}

interface HabitState {
  monthlyProgress: MonthlyProgress[];
  currentMonth: string;
  loading: boolean;
  error: string | null;
  
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'current' | 'streak'>) => Promise<void>;
  updateHabitProgress: (progressId: string, habits: Habit[], overall: number) => Promise<void>;
  removeHabit: (month: string, habitName: string) => void;
  setCurrentMonth: (month: string) => void;
  createMonthlyProgress: (month: string, userId: string) => void;
  setMonthlyProgress: (progress: MonthlyProgress[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const calculateOverallProgress = (habits: Habit[]): number => {
  if (habits.length === 0) return 0;
  
  const total = habits.reduce((sum, habit) => {
    const percentage = (habit.current / habit.target) * 100;
    return sum + percentage;
  }, 0);
  
  return Math.round((total / habits.length) * 10) / 10; // Round to 1 decimal place
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      monthlyProgress: [],
      currentMonth: format(new Date(), 'MMMM yyyy', { locale: ptBR }),
      loading: false,
      error: null,
      
      fetchHabits: async () => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;
        
        set({ loading: true });
        
        try {
          const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Convert database format to our app format
          const formattedProgress: MonthlyProgress[] = data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            month: item.month,
            habits: item.habits as Habit[],
            overall: item.overall || 0
          }));
          
          set({ monthlyProgress: formattedProgress });
          
          // Create current month if it doesn't exist
          const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
          const monthExists = formattedProgress.some(p => p.month === currentMonth);
          
          if (!monthExists) {
            await get().createMonthlyProgress(currentMonth, user.id);
          }
        } catch (error) {
          console.error('Error fetching habits:', error);
          set({ error: 'Falha ao carregar hábitos' });
        } finally {
          set({ loading: false });
        }
      },
      
      createMonthlyProgress: async (month, userId) => {
        const exists = get().monthlyProgress.some(p => p.month === month);
        
        if (!exists) {
          try {
            const newProgress: MonthlyProgress = {
              id: crypto.randomUUID(),
              user_id: userId,
              month,
              habits: [],
              overall: 0,
            };
            
            const { error } = await supabase
              .from('progress')
              .insert({
                id: newProgress.id,
                user_id: userId,
                month,
                habits: [],
                overall: 0
              });
              
            if (error) throw error;
            
            set((state) => ({
              monthlyProgress: [...state.monthlyProgress, newProgress],
            }));
          } catch (error) {
            console.error('Error creating monthly progress:', error);
          }
        }
      },
      
      setCurrentMonth: (month) => {
        set({ currentMonth: month });
      },
      
      addHabit: async (habit) => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;
        
        const currentMonth = get().currentMonth;
        const monthProgress = get().monthlyProgress.find(p => p.month === currentMonth);
        
        if (!monthProgress) {
          console.error('Month progress not found');
          return;
        }
        
        // Check if habit already exists
        const habitExists = monthProgress.habits.some(h => h.name === habit.name);
        if (habitExists) return;
        
        const newHabit: Habit = {
          id: crypto.randomUUID(),
          name: habit.name,
          target: habit.target,
          unit: habit.unit,
          current: 0,
          streak: 0
        };
        
        const updatedHabits = [...monthProgress.habits, newHabit];
        const newOverall = calculateOverallProgress(updatedHabits);
        
        try {
          const { error } = await supabase
            .from('progress')
            .update({
              habits: updatedHabits,
              overall: newOverall
            })
            .eq('id', monthProgress.id);
            
          if (error) throw error;
          
          set((state) => ({
            monthlyProgress: state.monthlyProgress.map((progress) => {
              if (progress.id === monthProgress.id) {
                return {
                  ...progress,
                  habits: updatedHabits,
                  overall: newOverall
                };
              }
              return progress;
            })
          }));
        } catch (error) {
          console.error('Error adding habit:', error);
        }
      },
      
      updateHabitProgress: async (progressId, habits, overall) => {
        try {
          const { error } = await supabase
            .from('progress')
            .update({
              habits,
              overall
            })
            .eq('id', progressId);
            
          if (error) throw error;
          
          set((state) => ({
            monthlyProgress: state.monthlyProgress.map((progress) => {
              if (progress.id === progressId) {
                return {
                  ...progress,
                  habits,
                  overall
                };
              }
              return progress;
            })
          }));
        } catch (error) {
          console.error('Error updating habit progress:', error);
          throw error;
        }
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
          
          return {
            monthlyProgress: updatedProgress,
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
