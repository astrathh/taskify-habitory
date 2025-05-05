
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAppointmentStore } from '@/store/appointmentStore';

const COLORS = ['#CFff00', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const AppointmentsCharts = () => {
  const { appointments } = useAppointmentStore();

  // Convert date objects to the month name
  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { month: 'short' });
  };

  // Group appointments by month
  const appointmentsByMonth = useMemo(() => {
    const groupedByMonth: Record<string, number> = {};
    
    appointments.forEach((appointment) => {
      const month = getMonthName(appointment.date);
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = 0;
      }
      groupedByMonth[month] += 1;
    });
    
    return Object.entries(groupedByMonth).map(([month, count]) => ({
      month,
      count: Math.round(count) // Ensure count is an integer
    }));
  }, [appointments]);

  // Group appointments by location (or "Não definido" if no location)
  const appointmentsByLocation = useMemo(() => {
    const groupedByLocation: Record<string, number> = {};
    
    appointments.forEach((appointment) => {
      const location = appointment.location || "Não definido";
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = 0;
      }
      groupedByLocation[location] += 1;
    });
    
    return Object.entries(groupedByLocation).map(([name, value]) => ({
      name,
      value: Math.round(value) // Ensure value is an integer
    }));
  }, [appointments]);

  // Ensure data exists before rendering
  const hasPieData = appointmentsByLocation.length > 0;
  const hasBarData = appointmentsByMonth.length > 0;

  // Calculate future vs past appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureAppointments = appointments.filter(
    (appointment) => new Date(appointment.date) >= today
  ).length;
  
  const pastAppointments = appointments.filter(
    (appointment) => new Date(appointment.date) < today
  ).length;
  
  const timelineData = [
    { name: 'Passados', value: Math.round(pastAppointments) },
    { name: 'Futuros', value: Math.round(futureAppointments) }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Compromissos por Mês</CardTitle>
          <CardDescription>Distribuição de compromissos ao longo dos meses</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {hasBarData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} /> {/* Ensure only integers on Y axis */}
                <Tooltip formatter={(value) => [Math.round(Number(value)), 'Compromissos']} />
                <Bar dataKey="count" fill="#cfff00" name="Compromissos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compromissos por Local</CardTitle>
          <CardDescription>Distribuição de compromissos por localização</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {hasPieData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentsByLocation}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {appointmentsByLocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Math.round(Number(value)), 'Compromissos']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Linha do Tempo de Compromissos</CardTitle>
          <CardDescription>Compromissos passados vs. futuros</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} /> {/* Ensure only integers on X axis */}
              <YAxis type="category" dataKey="name" />
              <Tooltip formatter={(value) => [Math.round(Number(value)), 'Compromissos']} />
              <Bar dataKey="value" fill="#cfff00" name="Compromissos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsCharts;
