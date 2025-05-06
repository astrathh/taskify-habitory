
import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isEqual, parseISO, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { TrackableItem } from '@/store/trackableItemStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface WeeklyProgressChartProps {
  items: TrackableItem[];
  weeksToShow?: number;
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  items,
  weeksToShow = 1
}) => {
  const weeklyData = useMemo(() => {
    const today = new Date();
    
    // Generate data for the last N weeks
    const weeklyStats = Array.from({ length: weeksToShow }).map((_, weekIndex) => {
      const weekStart = startOfWeek(subWeeks(today, weekIndex), { locale: ptBR });
      const weekEnd = endOfWeek(weekStart, { locale: ptBR });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Map each day of the week with its completed items
      const dailyStats = weekDays.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        
        // Count tasks completed on this day
        const completedTasks = items.filter(item => 
          item.type === 'task' && 
          item.status === 'concluída' && 
          item.original.updated_at &&
          format(new Date(item.original.updated_at), 'yyyy-MM-dd') === dayStr
        ).length;
        
        // Count habits completed on this day
        const completedHabits = items.filter(item => 
          item.type === 'habit' && 
          item.isCompleted
        ).length;
        
        return {
          date: dayStr,
          day: format(day, 'EEE', { locale: ptBR }),
          completedTasks,
          completedHabits,
          total: completedTasks + completedHabits
        };
      });
      
      return {
        weekStart: format(weekStart, 'dd/MM/yyyy', { locale: ptBR }),
        weekEnd: format(weekEnd, 'dd/MM/yyyy', { locale: ptBR }),
        days: dailyStats,
        weekNumber: -weekIndex // Negative to indicate weeks ago
      };
    });
    
    return weeklyStats;
  }, [items, weeksToShow]);
  
  const currentWeekData = weeklyData[0];
  
  // Calculate completion rate and streaks
  const stats = useMemo(() => {
    const totalItems = items.length;
    const completedItems = items.filter(item => item.isCompleted).length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // Get the longest streak
    const longestStreak = items.reduce((max, item) => {
      return item.streak && item.streak > max ? item.streak : max;
    }, 0);
    
    return {
      totalItems,
      completedItems,
      completionRate,
      longestStreak
    };
  }, [items]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Itens Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Maior Sequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Progresso Semanal</CardTitle>
          <CardDescription>
            {currentWeekData.weekStart} a {currentWeekData.weekEnd}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            <ChartContainer config={{
              completedTasks: { label: "Tarefas", color: "#8B5CF6" },
              completedHabits: { label: "Hábitos", color: "#84cc16" },
              total: { label: "Total", color: "#0EA5E9" }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentWeekData.days}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedTasks" name="Tarefas" fill="#8B5CF6" />
                  <Bar dataKey="completedHabits" name="Hábitos" fill="#84cc16" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Conclusão</CardTitle>
          <CardDescription>
            Últimas {weeksToShow} semanas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            <ChartContainer config={{
              total: { label: "Total de Itens", color: "#0EA5E9" }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={
                  weeklyData.flatMap(week => 
                    week.days.map(day => ({
                      ...day,
                      weekLabel: `Semana ${Math.abs(week.weekNumber)}`
                    }))
                  )
                }>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      return format(parseISO(value), 'dd/MM', { locale: ptBR });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      return format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR });
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Itens Concluídos" stroke="#0EA5E9" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProgressChart;
