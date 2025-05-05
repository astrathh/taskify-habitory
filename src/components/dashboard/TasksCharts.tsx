
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/store/taskStore';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
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

const STATUS_COLORS = {
  'pendente': '#fbbf24',
  'em progresso': '#60a5fa',
  'concluída': '#cfff00',
  'cancelada': '#f87171',
};

const PRIORITY_COLORS = {
  'baixa': '#a7f3d0',
  'média': '#fbbf24',
  'alta': '#f87171',
};

const CATEGORY_COLORS = {
  'Trabalho': '#60a5fa',
  'Pessoal': '#a7f3d0',
  'Financeiro': '#cfff00',
  'Saúde': '#fbbf24',
  'Outro': '#d1d5db',
};

const TasksCharts = () => {
  const { tasks } = useTaskStore();
  
  // Data for tasks by status
  const tasksByStatusData = useMemo(() => {
    const statusCounts = {
      'pendente': 0,
      'em progresso': 0,
      'concluída': 0,
      'cancelada': 0,
    };
    
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status],
      color: STATUS_COLORS[status]
    }));
  }, [tasks]);
  
  // Data for tasks by priority
  const tasksByPriorityData = useMemo(() => {
    const priorityCounts = {
      'baixa': 0,
      'média': 0,
      'alta': 0,
    };
    
    tasks.forEach(task => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });
    
    return Object.keys(priorityCounts).map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: priorityCounts[priority],
      color: PRIORITY_COLORS[priority]
    }));
  }, [tasks]);
  
  // Data for tasks by category
  const tasksByCategoryData = useMemo(() => {
    const categoryCounts = {};
    
    tasks.forEach(task => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });
    
    return Object.keys(categoryCounts).map(category => ({
      name: category,
      value: categoryCounts[category],
      color: CATEGORY_COLORS[category] || '#d1d5db'
    }));
  }, [tasks]);
  
  // Data for upcoming tasks by due date (next 7 days)
  const upcomingTasksData = useMemo(() => {
    const today = new Date();
    const next7Days = {};
    
    // Initialize next 7 days
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: ptBR });
      next7Days[dateKey] = { 
        name: i === 0 ? 'Hoje' : dayName,
        value: 0, 
        date: dateKey 
      };
    }
    
    // Count tasks for each day
    tasks.forEach(task => {
      try {
        const dueDate = parseISO(task.due_date);
        const dateKey = format(dueDate, 'yyyy-MM-dd');
        
        // Only count tasks due in the next 7 days
        if (dateKey in next7Days && 
            (task.status === 'pendente' || task.status === 'em progresso')) {
          next7Days[dateKey].value++;
        }
      } catch (error) {
        console.error('Error parsing task due date:', error);
      }
    });
    
    return Object.values(next7Days);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="bg-lime-300 dark:bg-lime-700 py-4 px-6 rounded-lg">
        <h2 className="text-xl font-bold text-center text-black dark:text-white">ANÁLISE DE TAREFAS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>STATUS DAS TAREFAS</CardTitle>
            <CardDescription>
              Distribuição de tarefas por status
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value, percent }) => 
                    `${name}: ${Math.round(value)} (${Math.round(percent * 100)}%)`
                  }
                >
                  {tasksByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Tarefas']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>TAREFAS POR PRIORIDADE</CardTitle>
            <CardDescription>
              Distribuição de tarefas por nível de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={tasksByPriorityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Tarefas']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tasksByPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>TAREFAS POR CATEGORIA</CardTitle>
            <CardDescription>
              Distribuição de tarefas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={tasksByCategoryData}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Tarefas']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tasksByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>TAREFAS PARA OS PRÓXIMOS DIAS</CardTitle>
            <CardDescription>
              Quantidade de tarefas pendentes e em progresso para os próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={upcomingTasksData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value)}`} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value))}`, 'Tarefas']} />
                <Bar dataKey="value" fill="#cfff00" barSize={35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksCharts;
