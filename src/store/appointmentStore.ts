
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  location: string;
  date: string;
  reminder: boolean;
  created_at: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  fetchAppointments: () => Promise<void>;
  setAppointments: (appointments: Appointment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      loading: false,
      error: null,
      
      addAppointment: async (appointmentData) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('appointments')
            .insert([appointmentData])
            .select()
            .single();
          
          if (error) throw error;
          
          set((state) => ({
            appointments: [...state.appointments, data],
            loading: false,
          }));
          
          return data;
        } catch (error) {
          console.error('Error adding appointment:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateAppointment: async (id, updatedAppointment) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('appointments')
            .update(updatedAppointment)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          set((state) => ({
            appointments: state.appointments.map((appointment) =>
              appointment.id === id ? { ...appointment, ...data } : appointment
            ),
            loading: false,
          }));
        } catch (error) {
          console.error('Error updating appointment:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      deleteAppointment: async (id) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            appointments: state.appointments.filter(
              (appointment) => appointment.id !== id
            ),
            loading: false,
          }));
        } catch (error) {
          console.error('Error deleting appointment:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      fetchAppointments: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ appointments: data || [], loading: false });
        } catch (error) {
          console.error('Error fetching appointments:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      setAppointments: (appointments) => {
        set({ appointments });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'appointments-storage',
    }
  )
);
