
import React, { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/store/taskStore';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

interface WeeklyProgressChartProps {
  tasks: Task[];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ tasks }) => {
  const weeklyData = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'EEE', { locale: ptBR });
      
      // Find tasks due on this date
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return format(taskDate, 'yyyy-MM-dd') === dateStr;
      });
      
      // Find completed tasks for this date
      const completedTasks = dayTasks.filter(task => task.status === 'concluída');
      
      // Calculate completion rate
      const completionRate = dayTasks.length > 0 
        ? Math.round((completedTasks.length / dayTasks.length) * 100) 
        : 0;
      
      return {
        date: dateStr,
        day: dayLabel,
        total: dayTasks.length,
        completed: completedTasks.length,
        completionRate
      };
    });

    return last7Days;
  }, [tasks]);

  const config = {
    completed: {
      label: "Concluídas",
      theme: {
        light: "#3B82F6",
        dark: "#60A5FA",
      },
    },
    total: {
      label: "Total",
      theme: {
        light: "#f0f0f0",
        dark: "#2e2e2e",
      },
    }
  };

  // Calculate overall statistics
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      const dayData = weeklyData[i];
      if (dayData.total > 0 && dayData.completionRate === 100) {
        streak++;
      } else if (i !== weeklyData.length - 1) { // Don't break streak on today if there are no tasks
        break;
      }
    }
    return streak;
  }, [weeklyData]);

  const averageCompletionRate = useMemo(() => {
    const daysWithTasks = weeklyData.filter(day => day.total > 0);
    if (daysWithTasks.length === 0) return 0;
    
    const sum = daysWithTasks.reduce((acc, day) => acc + day.completionRate, 0);
    return Math.round(sum / daysWithTasks.length);
  }, [weeklyData]);

  const totalCompleted = weeklyData.reduce((acc, day) => acc + day.completed, 0);
  const totalTasks = weeklyData.reduce((acc, day) => acc + day.total, 0);

  // Custom tooltip component for the chart
  const CustomTooltipContent = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-2 border border-border rounded-md shadow-md">
          <p className="font-medium">{`Dia: ${payload[0].payload.day}`}</p>
          <p className="text-sm">{`Total: ${payload[0].payload.total}`}</p>
          <p className="text-sm">{`Concluídas: ${payload[0].payload.completed}`}</p>
          <p className="text-sm">{`Taxa: ${payload[0].payload.completionRate}%`}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{streakDays}</p>
          <p className="text-sm text-muted-foreground">Dias seguidos</p>
        </div>
        <div className="p-4 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{averageCompletionRate}%</p>
          <p className="text-sm text-muted-foreground">Taxa média de conclusão</p>
        </div>
        <div className="p-4 border rounded-lg bg-card shadow-sm flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{totalCompleted}/{totalTasks}</p>
          <p className="text-sm text-muted-foreground">Tarefas concluídas na semana</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 h-80 bg-card">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={0}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tickFormatter={(value: number) => `${value}`}
              />
              <Tooltip content={<CustomTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`total-cell-${index}`} />
                ))}
              </Bar>
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`completed-cell-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
