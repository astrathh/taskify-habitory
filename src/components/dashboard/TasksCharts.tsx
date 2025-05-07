
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/store/taskStore';
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
  Area,
  AreaChart,
} from 'recharts';
import { format, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const COLORS = {
  pending: '#fbbf24',
  inProgress: '#cfff00',
  completed: '#22c55e',
  canceled: '#ef4444',
  alta: '#ef4444',
  media: '#fbbf24',
  baixa: '#22c55e',
};

const STATUS_COLORS = {
  'pendente': COLORS.pending,
  'em progresso': COLORS.inProgress,
  'concluída': COLORS.completed,
  'cancelada': COLORS.canceled
};

export const TasksCharts = () => {
  const { tasks } = useTaskStore();
  
  // Data for tasks by priority
  const tasksByPriority = useMemo(() => {
    const priorityCount = {
      'baixa': 0,
      'média': 0,
      'alta': 0
    };
    
    tasks.forEach(task => {
      if (priorityCount[task.priority as keyof typeof priorityCount] !== undefined) {
        priorityCount[task.priority as keyof typeof priorityCount]++;
      }
    });
    
    return [
      { name: 'Alta', value: priorityCount.alta, color: COLORS.alta },
      { name: 'Média', value: priorityCount.média, color: COLORS.media },
      { name: 'Baixa', value: priorityCount.baixa, color: COLORS.baixa }
    ];
  }, [tasks]);
  
  // Data for tasks by status
  const tasksByStatus = useMemo(() => {
    const statusCount = {
      'pendente': 0,
      'em progresso': 0,
      'concluída': 0,
      'cancelada': 0
    };
    
    tasks.forEach(task => {
      if (statusCount[task.status as keyof typeof statusCount] !== undefined) {
        statusCount[task.status as keyof typeof statusCount]++;
      }
    });
    
    return [
      { name: 'Pendente', value: statusCount.pendente, color: STATUS_COLORS.pendente },
      { name: 'Em Progresso', value: statusCount['em progresso'], color: STATUS_COLORS['em progresso'] },
      { name: 'Concluída', value: statusCount.concluída, color: STATUS_COLORS.concluída },
      { name: 'Cancelada', value: statusCount.cancelada, color: STATUS_COLORS.cancelada }
    ];
  }, [tasks]);
  
  // Data for tasks by category
  const tasksByCategory = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.category) {
        if (!categoryCount[task.category]) {
          categoryCount[task.category] = 0;
        }
        categoryCount[task.category]++;
      }
    });
    
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 categories
  }, [tasks]);
  
  // Data for upcoming vs overdue tasks
  const tasksByDueDate = useMemo(() => {
    const today = startOfDay(new Date());
    const next7Days = endOfDay(addDays(today, 7));
    const next14Days = endOfDay(addDays(today, 14));
    const next30Days = endOfDay(addDays(today, 30));
    
    const overdue = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      isBefore(new Date(task.due_date), today)
    ).length;
    
    const dueToday = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      format(new Date(task.due_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    ).length;
    
    const dueThisWeek = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      isAfter(new Date(task.due_date), today) && 
      isBefore(new Date(task.due_date), next7Days)
    ).length;
    
    const dueNext7to14Days = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      isAfter(new Date(task.due_date), next7Days) && 
      isBefore(new Date(task.due_date), next14Days)
    ).length;
    
    const dueNext15to30Days = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      isAfter(new Date(task.due_date), next14Days) && 
      isBefore(new Date(task.due_date), next30Days)
    ).length;
    
    const dueLater = tasks.filter(task => 
      task.status !== 'concluída' && 
      task.status !== 'cancelada' && 
      isAfter(new Date(task.due_date), next30Days)
    ).length;
    
    return [
      { name: 'Atrasadas', value: overdue, color: '#ef4444' },
      { name: 'Hoje', value: dueToday, color: '#f97316' },
      { name: 'Próximos 7 dias', value: dueThisWeek, color: '#fbbf24' },
      { name: '8-14 dias', value: dueNext7to14Days, color: '#84cc16' },
      { name: '15-30 dias', value: dueNext15to30Days, color: '#22c55e' },
      { name: 'Mais tarde', value: dueLater, color: '#3b82f6' },
    ];
  }, [tasks]);
  
  // Trend data for completed tasks over time
  const completionTrendData = useMemo(() => {
    if (tasks.length === 0) return [];
    
    // Get tasks completed in the last 30 days
    const today = startOfDay(new Date());
    const days30Ago = startOfDay(addDays(today, -30));
    
    const completedTasks = tasks.filter(task => 
      task.status === 'concluída' && 
      isAfter(new Date(task.updated_at || task.created_at), days30Ago)
    );
    
    // Group by day
    const completionByDay: Record<string, number> = {};
    
    for (let i = 0; i <= 30; i++) {
      const day = format(addDays(days30Ago, i), 'yyyy-MM-dd');
      completionByDay[day] = 0;
    }
    
    completedTasks.forEach(task => {
      const day = format(new Date(task.updated_at || task.created_at), 'yyyy-MM-dd');
      if (completionByDay[day] !== undefined) {
        completionByDay[day]++;
      }
    });
    
    // Convert to array for chart
    return Object.entries(completionByDay).map(([date, count]) => ({
      date: format(new Date(date), 'dd/MM', { locale: ptBR }),
      count
    }));
  }, [tasks]);
  
  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 'concluída');
    const totalTasks = tasks.length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    // Calculate average time to completion (in days)
    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalCompletionTime = completedTasks.reduce((sum, task) => {
        const createdDate = new Date(task.created_at);
        const completedDate = new Date(task.updated_at || task.created_at);
        const daysToComplete = Math.max(0, Math.floor((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + daysToComplete;
      }, 0);
      
      avgCompletionTime = Math.round(totalCompletionTime / completedTasks.length);
    }
    
    return {
      completionRate,
      avgCompletionTime,
      totalCompleted: completedTasks.length,
      totalPending: tasks.filter(task => task.status === 'pendente').length,
      totalInProgress: tasks.filter(task => task.status === 'em progresso').length,
    };
  }, [tasks]);
  
  // Custom Tooltip for the Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background shadow-lg p-2 border rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${Math.round(payload[0].value)}`}</p>
          <p className="text-sm">{`${Math.round((payload[0].value / tasks.length) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom Tooltip for the Category Chart
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background shadow-lg p-2 border rounded-md">
          <p className="font-medium">{`${data.name}`}</p>
          <p className="text-sm">{`Total: ${Math.round(data.value)} tarefa(s)`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-primary py-4 px-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center text-primary-foreground">ANÁLISE DE TAREFAS</h2>
      </div>
      
      {/* Métricas de Eficiência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa de Conclusão</CardTitle>
            <CardDescription>Performance geral nas tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={efficiencyMetrics.completionRate >= 66 ? "#22c55e" : 
                           efficiencyMetrics.completionRate >= 33 ? "#fbbf24" : "#ef4444"}
                    strokeWidth="10"
                    strokeDasharray={`${efficiencyMetrics.completionRate * 2.83} 283`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{efficiencyMetrics.completionRate}%</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {efficiencyMetrics.totalCompleted} de {tasks.length} tarefas concluídas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Atual</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Pendentes</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline">{efficiencyMetrics.totalPending}</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Em Progresso</span>
                </div>
                <div>
                  <Badge variant="outline">{efficiencyMetrics.totalInProgress}</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Concluídas</span>
                </div>
                <div>
                  <Badge variant="outline">{efficiencyMetrics.totalCompleted}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tempo Médio</CardTitle>
            <CardDescription>Dias para completar tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold mb-2">{efficiencyMetrics.avgCompletionTime}</div>
              <p className="text-sm text-muted-foreground text-center">
                Dias em média para completar uma tarefa
              </p>
              {efficiencyMetrics.avgCompletionTime > 0 && (
                <div className="mt-4">
                  <Badge variant={efficiencyMetrics.avgCompletionTime <= 2 ? 'success' : 
                        efficiencyMetrics.avgCompletionTime <= 5 ? 'default' : 'destructive'}>
                    {efficiencyMetrics.avgCompletionTime <= 2 ? 'Excelente' : 
                     efficiencyMetrics.avgCompletionTime <= 5 ? 'Normal' : 'Precisa melhorar'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>TAREFAS POR PRIORIDADE</CardTitle>
            <CardDescription>
              Distribuição das tarefas por nível de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                >
                  {tasksByPriority.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>STATUS DAS TAREFAS</CardTitle>
            <CardDescription>
              Estado atual das tarefas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tasksByStatus}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value, name, props) => {
                  return [`${Math.round(Number(value))} tarefa(s)`, `${props.payload.name}`];
                }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tasksByStatus.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>TAREFAS POR CATEGORIA</CardTitle>
            <CardDescription>
              Top categorias com mais tarefas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tasksByCategory}
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
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar dataKey="value" fill="#cfff00" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Segunda fileira de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>TAREFAS POR VENCIMENTO</CardTitle>
            <CardDescription>
              Distribuição das tarefas pendentes por data de vencimento
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByDueDate}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tasksByDueDate.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value} tarefa(s)`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>TENDÊNCIA DE CONCLUSÃO</CardTitle>
            <CardDescription>
              Tarefas concluídas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={completionTrendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.split('/')[0]}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tarefa(s)`, "Tarefas Concluídas"]} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  fill="#3b82f680"
                  name="Tarefas Concluídas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksCharts;
