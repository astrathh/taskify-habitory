
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrackableItem } from '@/store/trackableItemStore';
import { eachDayOfInterval, format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  name: string;
  completed: number;
  total: number;
  date: Date;
}

interface WeeklyProgressChartProps {
  items: TrackableItem[];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ items }) => {
  // Generate last 7 days data
  const getWeeklyData = (): ChartData[] => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // End on Sunday
    
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => {
      const dayItems = items.filter(item => {
        // For tasks, check if due date is this day
        if (item.type === 'task' && item.dueDate) {
          const dueDate = new Date(item.dueDate);
          return dueDate.toDateString() === day.toDateString();
        }
        
        // For habits, consider all habits as daily items
        return item.type === 'habit';
      });
      
      const completedItems = dayItems.filter(item => 
        item.status === 'concluída' || 
        item.status === 'completed'
      );
      
      return {
        name: format(day, 'EEE', { locale: ptBR }),
        completed: completedItems.length,
        total: dayItems.length,
        date: day
      };
    });
  };

  // Calculate completion rate for the week
  const getCompletionRate = (data: ChartData[]): number => {
    const totalTasks = data.reduce((sum, day) => sum + day.total, 0);
    const completedTasks = data.reduce((sum, day) => sum + day.completed, 0);
    
    return totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
  };

  const weeklyData = getWeeklyData();
  const completionRate = getCompletionRate(weeklyData);
  
  // Find the longest streak (consecutive days with completed items)
  const calculateStreak = (): number => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    const today = new Date();
    const past30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, i);
      return date.toDateString();
    });
    
    for (const dayString of past30Days) {
      const dayDate = new Date(dayString);
      const dayItems = items.filter(item => {
        if (item.type === 'task' && item.dueDate) {
          const dueDate = new Date(item.dueDate);
          return dueDate.toDateString() === dayString;
        }
        return item.type === 'habit';
      });
      
      if (dayItems.length > 0) {
        const completedItems = dayItems.filter(item => 
          item.status === 'concluída' || 
          item.status === 'completed'
        );
        
        // Consider day successful if at least one item was completed
        if (completedItems.length > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          // Break streak
          currentStreak = 0;
        }
      } else {
        // No items for this day, don't break streak
        // This logic could be changed if we want any day without completed items to break streak
        continue;
      }
    }
    
    return maxStreak;
  };

  const streak = calculateStreak();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso Semanal</CardTitle>
        <CardDescription>
          Taxa de conclusão e sequência atual
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Itens']} 
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar name="Concluídos" dataKey="completed" fill="#cfff00" />
            <Bar name="Total" dataKey="total" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="text-sm font-medium">Taxa de Conclusão:</span>
          <span className="ml-2 text-lg font-bold">{completionRate}%</span>
        </div>
        <div>
          <span className="text-sm font-medium">Sequência Atual:</span>
          <span className="ml-2 text-lg font-bold">{streak} dias</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WeeklyProgressChart;
