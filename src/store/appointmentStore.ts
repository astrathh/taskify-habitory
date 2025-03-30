
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => void;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
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
      
      addAppointment: (appointmentData) => {
        const newAppointment: Appointment = {
          ...appointmentData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
      },
      
      updateAppointment: (id, updatedAppointment) => {
        set((state) => ({
          appointments: state.appointments.map((appointment) =>
            appointment.id === id
              ? { ...appointment, ...updatedAppointment }
              : appointment
          ),
        }));
      },
      
      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter(
            (appointment) => appointment.id !== id
          ),
        }));
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
