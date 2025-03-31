
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Task, TaskPriority, TaskStatus } from '@/store/taskStore';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  getPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  getStatusBadge: (status: TaskStatus) => React.ReactNode;
  isOverdue: (dueDate: string) => boolean;
  onEdit: (id: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  getPriorityBadge,
  getStatusBadge,
  isOverdue,
  onEdit,
}) => {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detalhes completos da tarefa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Categoria</p>
              <p>{task.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Prioridade</p>
              <div>{getPriorityBadge(task.priority)}</div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <div>{getStatusBadge(task.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Data Limite</p>
              <p className={isOverdue(task.due_date) && task.status !== 'concluída' ? 'text-red-600' : ''}>
                {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Descrição</p>
            <p className="text-sm text-muted-foreground">
              {task.description || "Nenhuma descrição fornecida."}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Data de Criação</p>
            <p className="text-sm">
              {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button
            onClick={() => {
              onClose();
              if (task) {
                onEdit(task.id);
              }
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
