
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
} from 'recharts';

const COLORS = ['#7c3aed', '#ef4444', '#fbbf24', '#22c55e'];
const STATUS_COLORS = {
  'pendente': '#fbbf24',
  'em progresso': '#7c3aed',
  'concluída': '#22c55e',
  'cancelada': '#ef4444'
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
      { name: 'Baixa', value: priorityCount.baixa },
      { name: 'Média', value: priorityCount.média },
      { name: 'Alta', value: priorityCount.alta }
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
  
  // Data for task details
  const taskDetails = useMemo(() => {
    return tasks.map(task => ({
      name: task.title,
      value: 1,
      category: task.category,
      status: task.status,
      priority: task.priority,
      dueDate: new Date(task.due_date).toLocaleDateString('pt-BR')
    }));
  }, [tasks]);
  
  // Custom Tooltip for the Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background shadow-lg p-2 border rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
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
          <p className="text-sm">{`Total: ${data.value} tarefa(s)`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-primary py-4 px-6 rounded-lg">
        <h2 className="text-xl font-bold text-center text-white">ANÁLISE DE TAREFAS</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
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
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
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
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => {
                  return [`${value} tarefa(s)`, `${props.payload.name}`];
                }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
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
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Bar dataKey="value" fill="#7c3aed" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksCharts;
