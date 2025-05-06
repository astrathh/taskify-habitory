
import React from 'react';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Check, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskStatus } from '@/store/taskStore';

interface TaskActionsProps {
  taskId: string;
  status: TaskStatus;
  onMarkComplete: (taskId: string) => Promise<void>;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  status,
  onMarkComplete,
  onEdit,
  onDelete,
}) => {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex items-center space-x-2">
      {status !== 'concluída' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
          onClick={(e) => handleAction(e, () => onMarkComplete(taskId))}
          title="Marcar como concluída"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
      
      {status !== 'cancelada' && status !== 'concluída' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
          onClick={(e) => handleAction(e, () => onDelete(taskId))}
          title="Cancelar tarefa"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(taskId)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(taskId)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskActions;
