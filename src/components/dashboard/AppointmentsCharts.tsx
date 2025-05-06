
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentStore } from '@/store/appointmentStore';
import { format, subMonths, isThisMonth, isAfter, isBefore, endOfMonth, startOfMonth, differenceInDays } from 'date-fns';
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

const COLORS = ['#cfff00', '#ef4444', '#fbbf24', '#22c55e'];

export const AppointmentsCharts = () => {
  const { appointments } = useAppointmentStore();
  
  // Data for appointments by month
  const appointmentsByMonth = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        name: format(date, 'MMM', { locale: ptBR }),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    }).reverse();
    
    const data = months.map(({ name, month, year }) => {
      const count = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === month && appointmentDate.getFullYear() === year;
      }).length;
      
      return {
        name,
        value: count,
      };
    });
    
    return data;
  }, [appointments]);
  
  // Data for appointments distribution
  const appointmentsDistribution = useMemo(() => {
    const now = new Date();
    const pastAppointments = appointments.filter(appointment => 
      isBefore(new Date(appointment.date), now)
    ).length;
    
    const currentMonthAppointments = appointments.filter(appointment => 
      isThisMonth(new Date(appointment.date))
    ).length;
    
    const futureAppointments = appointments.filter(appointment => 
      isAfter(new Date(appointment.date), now)
    ).length;
    
    return [
      { name: 'Passados', value: pastAppointments },
      { name: 'Este Mês', value: currentMonthAppointments },
      { name: 'Futuros', value: futureAppointments },
    ];
  }, [appointments]);
  
  // Data for appointments by day of week
  const appointmentsByDayOfWeek = useMemo(() => {
    const daysOfWeek = [
      'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
    ];
    
    const counts = Array(7).fill(0);
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.date);
      const dayOfWeek = date.getDay();
      counts[dayOfWeek]++;
    });
    
    return daysOfWeek.map((name, index) => ({
      name,
      value: counts[index],
    }));
  }, [appointments]);
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background shadow-lg p-2 border rounded-md">
          <p className="font-medium">{`${label}: ${Math.round(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-500 dark:bg-blue-700 py-4 px-6 rounded-lg">
        <h2 className="text-xl font-bold text-center text-white">ANÁLISE DE COMPROMISSOS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>COMPROMISSOS POR MÊS</CardTitle>
            <CardDescription>
              Quantidade de compromissos nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={appointmentsByMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => Math.round(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#cfff00" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>DISTRIBUIÇÃO DE COMPROMISSOS</CardTitle>
            <CardDescription>
              Compromissos passados vs. futuros
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                >
                  {appointmentsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Math.round(Number(value)), 'Compromissos']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>DIAS DA SEMANA</CardTitle>
            <CardDescription>
              Frequência de compromissos por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={appointmentsByDayOfWeek}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => Math.round(value)} />
                <Tooltip formatter={(value) => [Math.round(Number(value)), 'Compromissos']} />
                <Bar dataKey="value" fill="#22c55e" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsCharts;
