
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Task } from '@/store/taskStore';
import TaskDashboardWidget from './TaskDashboardWidget';

interface TaskMiniDashboardProps {
  tasks: Task[];
}

const TaskMiniDashboard: React.FC<TaskMiniDashboardProps> = ({ tasks }) => {
  // Calcular tarefas ativas (pendentes + em progresso)
  const activeTasks = tasks.filter(task => 
    task.status === 'pendente' || task.status === 'em progresso'
  ).length;

  // Mês atual
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  // Calcular progresso geral das tarefas
  const completedTasks = tasks.filter(task => task.status === 'concluída').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <TaskDashboardWidget
        title="Tarefas Ativas"
        value={activeTasks}
        icon={<CheckCircle className="h-4 w-4" />}
        description={`${activeTasks} tarefas em andamento`}
      />
      
      <TaskDashboardWidget
        title="Mês Atual"
        value={currentMonth}
        icon={<Calendar className="h-4 w-4" />}
        description="Período atual"
        className="capitalize"
      />
      
      <TaskDashboardWidget
        title="Progresso Geral"
        value={`${progressPercentage}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        description={`${completedTasks} de ${totalTasks} concluídas`}
      />
    </div>
  );
};

export default TaskMiniDashboard;
