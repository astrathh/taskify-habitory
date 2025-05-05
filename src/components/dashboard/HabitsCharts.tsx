
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabitStore } from '@/store/habitStore';
import { format, subMonths, getMonth, getYear } from 'date-fns';
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

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const COLORS = ['#cfff00', '#a7f3d0', '#fbbf24'];

export const HabitsCharts = () => {
  const { monthlyProgress } = useHabitStore();

  // Data preparation for Monthly Habits
  const monthlyHabitsData = useMemo(() => {
    const now = new Date();
    const currentYear = getYear(now);
    
    return MONTHS.map((month, index) => {
      const progressForMonth = monthlyProgress.find(
        (p) => {
          const monthName = month.toLowerCase();
          const progressMonth = p.month.toLowerCase();
          return progressMonth.includes(monthName) && 
                 progressMonth.includes(currentYear.toString());
        }
      );
      
      return {
        name: month,
        value: progressForMonth?.habits.length || 0,
      };
    });
  }, [monthlyProgress]);

  // Data preparation for Weekly Progress
  const weeklyProgressData = useMemo(() => {
    return [
      { name: 'Semana 1', value: 42 },
      { name: 'Semana 2', value: 65 },
      { name: 'Semana 3', value: 53 },
      { name: 'Semana 4', value: 78 },
      { name: 'Extra', value: 90 },
    ];
  }, []);

  // Data preparation for Annual Progress
  const annualProgressData = useMemo(() => {
    const totalHabits = monthlyProgress.reduce(
      (sum, progress) => sum + progress.habits.length, 
      0
    );
    
    const completedHabits = monthlyProgress.reduce(
      (sum, progress) => {
        const completed = progress.habits.filter(
          habit => habit.current >= habit.target
        ).length;
        return sum + completed;
      },
      0
    );
    
    const pendingHabits = totalHabits - completedHabits;
    
    return [
      { name: 'Realizados', value: completedHabits, percentage: Math.round(completedHabits / (totalHabits || 1) * 100) },
      { name: 'Pendentes', value: pendingHabits, percentage: Math.round(pendingHabits / (totalHabits || 1) * 100) },
    ];
  }, [monthlyProgress]);

  // Custom Tooltip for the Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background shadow-lg p-2 border rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${Math.round(payload[0].value)}`}</p>
          <p className="text-sm">{`${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-lime-300 dark:bg-lime-700 py-4 px-6 rounded-lg">
        <h2 className="text-xl font-bold text-center text-black dark:text-white">PROGRESSO DOS HÁBITOS DIÁRIOS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>HÁBITOS POR MÊS</CardTitle>
            <CardDescription>
              Quantidade de hábitos monitorados mensalmente
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyHabitsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
              >
                <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Hábitos']} />
                <Bar dataKey="value" fill="#cfff00" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>PROGRESSO SEMANAL HÁBITOS</CardTitle>
            <CardDescription>
              Percentual de conclusão por semana
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyProgressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" domain={[0, 125]} tickFormatter={(value) => `${Math.round(value)}`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, 'Progresso']} />
                <Bar dataKey="value" fill="#a7f3d0" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>PROGRESSO ANUAL DOS HÁBITOS</CardTitle>
            <CardDescription>
              Relação entre hábitos realizados e pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={annualProgressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                >
                  {annualProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitsCharts;
