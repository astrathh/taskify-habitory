
import React from 'react';
import { Task } from '@/store/taskStore';
import WeeklyTasksWidget from './WeeklyTasksWidget';
import PriorityTasksWidget from './PriorityTasksWidget';
import DueDateTasksWidget from './DueDateTasksWidget';
import TaskProgressWidget from './TaskProgressWidget';

interface TaskWidgetsSectionProps {
  tasks: Task[];
}

const TaskWidgetsSection: React.FC<TaskWidgetsSectionProps> = ({ tasks }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visão Geral das Tarefas</h2>
        <span className="text-sm text-muted-foreground">
          {tasks.length} tarefas no total
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskProgressWidget tasks={tasks} />
        <WeeklyTasksWidget tasks={tasks} />
        <PriorityTasksWidget tasks={tasks} />
        <DueDateTasksWidget tasks={tasks} />
      </div>
    </div>
  );
};

export default TaskWidgetsSection;
