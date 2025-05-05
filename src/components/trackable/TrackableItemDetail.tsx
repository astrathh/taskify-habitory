
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrackableItem } from '@/store/trackableItemStore';
import { Progress } from '@/components/ui/progress';
import { Edit, Calendar, Check, X, BarChart, Clock } from 'lucide-react';

interface TrackableItemDetailProps {
  item: TrackableItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, type: string) => void;
  onComplete: (id: string) => Promise<void>;
  onSkip: (id: string) => Promise<void>;
}

const TrackableItemDetail: React.FC<TrackableItemDetailProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onComplete,
  onSkip,
}) => {
  if (!item) return null;

  const isCompleted = 
    item.status === 'concluída' || 
    item.status === 'completed';
    
  const isCancelled = 
    item.status === 'cancelada' || 
    item.status === 'skipped';

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    const itemDate = new Date(dueDate);
    return itemDate < today && itemDate.toDateString() !== today.toDateString();
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    switch(priority) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'média':
        return <Badge variant="default" className="bg-yellow-500">Média</Badge>;
      case 'baixa':
        return <Badge variant="outline" className="text-green-600">Baixa</Badge>;
      default:
        return <Badge variant="outline">Indefinida</Badge>;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'concluída':
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Concluída</Badge>;
      case 'em progresso':
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-600">Em Progresso</Badge>;
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'cancelada':
      case 'skipped':
        return <Badge variant="default" className="bg-red-600">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
              {item.name}
            </span>
            <Badge variant={item.type === 'task' ? 'outline' : 'default'} className={item.type === 'habit' ? 'bg-lime-600 text-black' : ''}>
              {item.type === 'task' ? 'Tarefa' : 'Hábito'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {item.description && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
              <p className="text-sm">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <div>{getStatusBadge(item.status)}</div>
            </div>

            {item.type === 'task' && item.priority ? (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Prioridade</h4>
                <div>{getPriorityBadge(item.priority)}</div>
              </div>
            ) : null}

            {item.dueDate && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Data Limite</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue(item.dueDate) && !isCompleted ? "text-red-600" : ""}>
                    {format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}

            {item.type === 'task' && item.category ? (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Categoria</h4>
                <div>{item.category}</div>
              </div>
            ) : null}

            {item.type === 'habit' && (
              <>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Progresso</h4>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span>
                        {item.current} / {item.target} {item.unit}
                      </span>
                      <span>
                        {Math.round(((item.current || 0) / (item.target || 1)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(((item.current || 0) / (item.target || 1)) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Sequência</h4>
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{item.streak} dias</span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => onEdit(item.id, item.type)}
              className="mr-2"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onSkip(item.id);
                onClose();
              }}
              disabled={isCancelled}
              className="bg-red-100 hover:bg-red-200 text-red-800"
            >
              <X className="h-4 w-4 mr-2" />
              {item.type === 'task' ? 'Cancelar' : 'Pular'}
            </Button>
            <Button
              onClick={() => {
                onComplete(item.id);
                onClose();
              }}
              disabled={isCompleted}
              className="bg-cfff00 text-black hover:bg-lime-300"
            >
              <Check className="h-4 w-4 mr-2" />
              Concluir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackableItemDetail;
