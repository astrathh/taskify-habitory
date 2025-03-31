
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Task, TaskStatus } from '@/store/taskStore';
import TaskStatusDropdown from './TaskStatusDropdown';
import TaskActions from './TaskActions';

interface TaskListProps {
  tasks: Task[];
  isOverdue: (dueDate: string) => boolean;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getStatusBadge: (status: TaskStatus) => React.ReactNode;
  getStatusClasses: (status: TaskStatus) => string;
  handleStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  handleMarkComplete: (taskId: string) => Promise<void>;
  handleDelete: (taskId: string) => Promise<void>;
  openTaskModal: (task: Task) => void;
  navigate: (path: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isOverdue,
  getPriorityBadge,
  getStatusBadge,
  getStatusClasses,
  handleStatusChange,
  handleMarkComplete,
  handleDelete,
  openTaskModal,
  navigate,
}) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableCaption>Lista de tarefas - Total: {tasks.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data Limite</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow 
            key={task.id} 
            className="cursor-pointer hover:bg-muted/80"
            onClick={() => openTaskModal(task)}
          >
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{task.category}</TableCell>
            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <TaskStatusDropdown
                status={task.status}
                onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                getStatusBadge={getStatusBadge}
                getStatusClasses={getStatusClasses}
              />
            </TableCell>
            <TableCell className={isOverdue(task.due_date) && task.status !== 'concluída' ? 'text-red-600' : ''}>
              {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <TaskActions 
                taskId={task.id}
                status={task.status}
                onMarkComplete={handleMarkComplete}
                onEdit={(id) => navigate(`/tasks/edit/${id}`)}
                onDelete={handleDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
