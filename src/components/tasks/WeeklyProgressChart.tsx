
import React, { useMemo } from 'react';
import { format, subDays, startOfDay, isToday, isSameDay } from 'date-fns';
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
  Legend,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      const isCurrentDay = isToday(date);
      
      // Find tasks due on this date
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return isSameDay(taskDate, date);
      });
      
      // Find completed tasks for this date
      const completedTasks = dayTasks.filter(task => task.status === 'concluída');
      const pendingTasks = dayTasks.filter(task => task.status === 'pendente');
      const inProgressTasks = dayTasks.filter(task => task.status === 'em progresso');
      const canceledTasks = dayTasks.filter(task => task.status === 'cancelada');
      
      // Calculate completion rate
      const completionRate = dayTasks.length > 0 
        ? Math.round((completedTasks.length / dayTasks.length) * 100) 
        : 0;
      
      return {
        date: dateStr,
        day: dayLabel,
        total: dayTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        inProgress: inProgressTasks.length,
        canceled: canceledTasks.length,
        completionRate,
        isCurrentDay
      };
    });

    return last7Days;
  }, [tasks]);

  // Calcular dados por prioridade
  const tasksByPriority = useMemo(() => {
    const priorityCounts = {
      alta: tasks.filter(t => t.priority === 'alta').length,
      média: tasks.filter(t => t.priority === 'média').length,
      baixa: tasks.filter(t => t.priority === 'baixa').length,
    };
    
    return [
      { name: 'Alta', value: priorityCounts.alta, fill: '#ef4444' },
      { name: 'Média', value: priorityCounts.média, fill: '#f59e0b' },
      { name: 'Baixa', value: priorityCounts.baixa, fill: '#10b981' },
    ];
  }, [tasks]);

  const config = {
    completed: {
      label: "Concluídas",
      theme: {
        light: "#22c55e",
        dark: "#4ade80",
      },
    },
    pending: {
      label: "Pendentes",
      theme: {
        light: "#f59e0b",
        dark: "#fbbf24",
      },
    },
    inProgress: {
      label: "Em Progresso",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
    canceled: {
      label: "Canceladas",
      theme: {
        light: "#ef4444",
        dark: "#f87171",
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
  const totalPending = weeklyData.reduce((acc, day) => acc + day.pending, 0);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Concluídas', value: tasks.filter(t => t.status === 'concluída').length, fill: '#22c55e' },
    { name: 'Pendentes', value: tasks.filter(t => t.status === 'pendente').length, fill: '#f59e0b' },
    { name: 'Em Progresso', value: tasks.filter(t => t.status === 'em progresso').length, fill: '#3b82f6' },
    { name: 'Canceladas', value: tasks.filter(t => t.status === 'cancelada').length, fill: '#ef4444' },
  ];

  // Custom tooltip component for the chart
  const CustomTooltipContent = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-2 border border-border rounded-md shadow-md">
          <p className="font-medium">{`Dia: ${payload[0].payload.day}`}</p>
          <p className="text-sm">{`Total: ${payload[0].payload.total}`}</p>
          <p className="text-sm text-green-600">{`Concluídas: ${payload[0].payload.completed}`}</p>
          <p className="text-sm text-yellow-500">{`Pendentes: ${payload[0].payload.pending}`}</p>
          <p className="text-sm text-blue-500">{`Em Progresso: ${payload[0].payload.inProgress}`}</p>
          <p className="text-sm text-red-500">{`Canceladas: ${payload[0].payload.canceled}`}</p>
          <p className="text-sm font-medium">{`Taxa: ${payload[0].payload.completionRate}%`}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-primary">{streakDays}</div>
            <p className="text-sm text-muted-foreground">Dias seguidos concluindo tarefas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-primary">{averageCompletionRate}%</div>
            <p className="text-sm text-muted-foreground">Taxa média de conclusão</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-primary">{totalCompleted}/{totalTasks}</div>
            <p className="text-sm text-muted-foreground">Tarefas concluídas na semana</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Progresso Semanal</CardTitle>
            <CardDescription>
              Visão geral das suas tarefas nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Ajuste na altura do container e margem específica para garantir que o gráfico fique contido */}
            <div className="h-[300px] w-full">
              <ChartContainer config={config}>
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    barGap={0}
                    barSize={12}
                    style={{ fontSize: '12px' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="day" 
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      height={30}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(value: number) => `${value}`}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltipContent />} />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
                    <Bar dataKey="completed" name="Concluídas" stackId="a" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pendentes" stackId="a" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" name="Em Progresso" stackId="a" fill="var(--color-inProgress)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="canceled" name="Canceladas" stackId="a" fill="var(--color-canceled)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>
              Distribuição das tarefas por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tarefa(s)`, '']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
            <CardDescription>
              Distribuição das tarefas por nível de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={tasksByPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tarefa(s)`, '']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Taxa de Conclusão Diária</CardTitle>
            <CardDescription>
              Progresso de conclusão de tarefas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    height={30}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickFormatter={(value) => `${value}%`}
                    width={40}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conclusão']} />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    name="Taxa de Conclusão"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle>Resumo Semanal</CardTitle>
          <CardDescription>
            Detalhamento das tarefas por dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {weeklyData.map((day) => (
              <Card key={day.date} className={`${day.isCurrentDay ? 'border-primary' : ''} hover:shadow-md transition-all`}>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold">{day.day}</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(day.date), 'dd/MM')}</div>
                    {day.isCurrentDay && <Badge className="mt-1 bg-primary">Hoje</Badge>}
                    
                    <div className="mt-3 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total:</span>
                        <span className="font-medium">{day.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600">Concluídas:</span>
                        <span className="font-medium">{day.completed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-yellow-500">Pendentes:</span>
                        <span className="font-medium">{day.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-500">Em progresso:</span>
                        <span className="font-medium">{day.inProgress}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${day.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-1">
                      {day.completionRate}% concluído
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProgressChart;
