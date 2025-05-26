
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/store/taskStore';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface TaskProgressWidgetProps {
  tasks: Task[];
}

const TaskProgressWidget: React.FC<TaskProgressWidgetProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'concluída').length;
  const inProgressTasks = tasks.filter(task => task.status === 'em progresso').length;
  const pendingTasks = tasks.filter(task => task.status === 'pendente').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressRate = totalTasks > 0 ? Math.round(((completedTasks + inProgressTasks) / totalTasks) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Progresso Geral
        </CardTitle>
        <Badge variant="secondary">{completionRate}%</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Concluídas</span>
            <span>{completedTasks}/{totalTasks}</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Em Andamento</span>
            <span>{progressRate}%</span>
          </div>
          <Progress value={progressRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-800">{completedTasks}</div>
            <div className="text-xs text-green-600">Concluídas</div>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-800">{inProgressTasks}</div>
            <div className="text-xs text-blue-600">Em Progresso</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-800">{pendingTasks}</div>
            <div className="text-xs text-yellow-600">Pendentes</div>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {completionRate >= 80 ? 'Excelente progresso!' : 
               completionRate >= 50 ? 'Bom progresso!' : 
               'Continue assim!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskProgressWidget;
