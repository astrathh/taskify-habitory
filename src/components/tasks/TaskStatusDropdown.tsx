
import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskStatus } from '@/store/taskStore';

interface TaskStatusDropdownProps {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  getStatusBadge: (status: TaskStatus) => React.ReactNode;
  getStatusClasses: (status: TaskStatus) => string;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({
  status,
  onStatusChange,
  getStatusBadge,
  getStatusClasses,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1">
        {getStatusBadge(status)}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          className={getStatusClasses('pendente')}
          onClick={() => onStatusChange('pendente')}
        >
          Pendente
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={getStatusClasses('em progresso')}
          onClick={() => onStatusChange('em progresso')}
        >
          Em Progresso
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={getStatusClasses('concluída')}
          onClick={() => onStatusChange('concluída')}
        >
          Concluída
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={getStatusClasses('cancelada')}
          onClick={() => onStatusChange('cancelada')}
        >
          Cancelada
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskStatusDropdown;
