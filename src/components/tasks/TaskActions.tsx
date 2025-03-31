
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Edit, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  taskId: string;
  status: string;
  onMarkComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  status,
  onMarkComplete,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex justify-end gap-2">
      {status !== 'concluída' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onMarkComplete(taskId);
          }}
          title="Marcar como concluída"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(taskId);
        }}
        title="Editar tarefa"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(taskId);
        }}
        title="Excluir tarefa"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TaskActions;
