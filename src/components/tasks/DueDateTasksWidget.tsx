
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/store/taskStore';
import { Clock, AlertCircle } from 'lucide-react';
import { isToday, isTomorrow, isYesterday, isPast, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DueDateTasksWidgetProps {
  tasks: Task[];
}

const DueDateTasksWidget: React.FC<DueDateTasksWidgetProps> = ({ tasks }) => {
  const pendingTasks = tasks.filter(task => task.status !== 'concluída');

  const categorizedTasks = {
    overdue: pendingTasks.filter(task => isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))),
    today: pendingTasks.filter(task => isToday(new Date(task.due_date))),
    tomorrow: pendingTasks.filter(task => isTomorrow(new Date(task.due_date))),
    upcoming: pendingTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return !isPast(dueDate) && !isToday(dueDate) && !isTomorrow(dueDate);
    })
  };

  const categories = [
    {
      key: 'overdue',
      label: 'Atrasadas',
      tasks: categorizedTasks.overdue,
      color: 'bg-red-100 text-red-800 border-red-200',
      bgColor: 'bg-red-50',
      icon: <AlertCircle className="h-3 w-3" />
    },
    {
      key: 'today',
      label: 'Hoje',
      tasks: categorizedTasks.today,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      bgColor: 'bg-orange-50',
      icon: <Clock className="h-3 w-3" />
    },
    {
      key: 'tomorrow',
      label: 'Amanhã',
      tasks: categorizedTasks.tomorrow,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      bgColor: 'bg-blue-50',
      icon: <Clock className="h-3 w-3" />
    },
    {
      key: 'upcoming',
      label: 'Próximas',
      tasks: categorizedTasks.upcoming,
      color: 'bg-green-100 text-green-800 border-green-200',
      bgColor: 'bg-green-50',
      icon: <Clock className="h-3 w-3" />
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Por Vencimento
        </CardTitle>
        <Badge variant="secondary">{pendingTasks.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-64 overflow-y-auto space-y-2">
          {categories.map((category) => (
            <div
              key={category.key}
              className={`p-3 rounded-lg ${category.bgColor} border`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${category.color} flex items-center gap-1`}>
                  {category.icon}
                  {category.label}
                </Badge>
                <span className="text-sm font-medium">{category.tasks.length}</span>
              </div>
              {category.tasks.length > 0 && (
                <div className="space-y-1">
                  {category.tasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
                        {task.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                      </span>
                    </div>
                  ))}
                  {category.tasks.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{category.tasks.length - 2} mais
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DueDateTasksWidget;
