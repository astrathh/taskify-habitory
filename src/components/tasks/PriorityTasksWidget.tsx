
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/store/taskStore';
import { AlertTriangle } from 'lucide-react';

interface PriorityTasksWidgetProps {
  tasks: Task[];
}

const PriorityTasksWidget: React.FC<PriorityTasksWidgetProps> = ({ tasks }) => {
  const pendingTasks = tasks.filter(task => task.status !== 'concluída');
  
  const tasksByPriority = {
    alta: pendingTasks.filter(task => task.priority === 'alta'),
    média: pendingTasks.filter(task => task.priority === 'média'),
    baixa: pendingTasks.filter(task => task.priority === 'baixa'),
  };

  const priorityOrder = ['alta', 'média', 'baixa'] as const;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'alta':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50',
          count: tasksByPriority.alta.length
        };
      case 'média':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50',
          count: tasksByPriority.média.length
        };
      case 'baixa':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50',
          count: tasksByPriority.baixa.length
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50',
          count: 0
        };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Por Prioridade
        </CardTitle>
        <Badge variant="secondary">{pendingTasks.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorityOrder.map((priority) => {
          const config = getPriorityConfig(priority);
          return (
            <div
              key={priority}
              className={`p-3 rounded-lg ${config.bgColor} border`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${config.color}`}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Badge>
                <span className="text-sm font-medium">{config.count}</span>
              </div>
              {config.count > 0 && (
                <div className="space-y-1">
                  {tasksByPriority[priority].slice(0, 2).map((task) => (
                    <p key={task.id} className="text-xs text-muted-foreground truncate">
                      {task.title}
                    </p>
                  ))}
                  {config.count > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{config.count - 2} mais
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PriorityTasksWidget;
