
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentStore } from '@/store/appointmentStore';
import { format, subMonths, getMonth, getYear, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#cfff00', '#fbbf24', '#f87171', '#60a5fa'];

const AppointmentsCharts = () => {
  const { appointments } = useAppointmentStore();
  
  // Data for appointments by category
  const appointmentsByCategoryData = useMemo(() => {
    const categories = {};
    
    appointments.forEach(appointment => {
      const category = appointment.category || 'Sem categoria';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
  }, [appointments]);
  
  // Data for appointments by month
  const appointmentsByMonthData = useMemo(() => {
    const months = {};
    const today = new Date();
    
    // Initialize months (current month and next 5 months)
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      const monthKey = format(date, 'MM-yyyy');
      const monthName = format(date, 'MMM', { locale: ptBR });
      months[monthKey] = { name: monthName, value: 0 };
    }
    
    appointments.forEach(appointment => {
      try {
        const appointmentDate = parseISO(appointment.date);
        const monthKey = format(appointmentDate, 'MM-yyyy');
        
        // Only count future appointments in the next 6 months
        if (monthKey in months) {
          months[monthKey].value++;
        }
      } catch (error) {
        console.error('Error parsing appointment date:', error);
      }
    });
    
    return Object.values(months);
  }, [appointments]);
  
  // Distribution of appointments throughout the week
  const appointmentsWeekdayData = useMemo(() => {
    const weekdays = {
      'Dom': 0,
      'Seg': 0,
      'Ter': 0,
      'Qua': 0,
      'Qui': 0,
      'Sex': 0,
      'Sáb': 0,
    };
    
    appointments.forEach(appointment => {
      try {
        const appointmentDate = parseISO(appointment.date);
        const weekday = format(appointmentDate, 'EEE', { locale: ptBR });
        weekdays[weekday]++;
      } catch (error) {
        console.error('Error parsing appointment date:', error);
      }
    });
    
    return Object.keys(weekdays).map(day => ({
      name: day,
      value: weekdays[day]
    }));
  }, [appointments]);
  
  return (
    <div className="space-y-6">
      <div className="bg-lime-300 dark:bg-lime-700 py-4 px-6 rounded-lg">
        <h2 className="text-xl font-bold text-center text-black dark:text-white">ANÁLISE DE COMPROMISSOS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>COMPROMISSOS POR CATEGORIA</CardTitle>
            <CardDescription>
              Distribuição dos compromissos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentsByCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${Math.round(value)} (${Math.round(percent * 100)}%)`
                  }
                >
                  {appointmentsByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Compromissos']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>COMPROMISSOS FUTUROS</CardTitle>
            <CardDescription>
              Distribuição de compromissos nos próximos meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={appointmentsByMonthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value)}`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Compromissos']} />
                <Bar dataKey="value" fill="#cfff00" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>DISTRIBUIÇÃO NA SEMANA</CardTitle>
            <CardDescription>
              Frequência de compromissos por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={appointmentsWeekdayData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value)}`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Compromissos']} />
                <Bar dataKey="value" fill="#60a5fa" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsCharts;
