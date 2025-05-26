
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/store/taskStore';
import { isThisWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface WeeklyTasksWidgetProps {
  tasks: Task[];
}

const WeeklyTasksWidget: React.FC<WeeklyTasksWidgetProps> = ({ tasks }) => {
  const weeklyTasks = tasks.filter(task => 
    isThisWeek(new Date(task.due_date)) && task.status !== 'concluída'
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Tarefas desta Semana
        </CardTitle>
        <Badge variant="secondary">{weeklyTasks.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {weeklyTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma tarefa para esta semana
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {weeklyTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
              </div>
            ))}
            {weeklyTasks.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{weeklyTasks.length - 5} mais tarefas
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTasksWidget;
