
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { TrackableItem } from '@/store/trackableItemStore';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TrackableItemListProps {
  items: TrackableItem[];
  onComplete: (itemId: string) => Promise<void>;
  onSkip: (itemId: string) => Promise<void>;
  onItemClick: (item: TrackableItem) => void;
}

const TrackableItemList: React.FC<TrackableItemListProps> = ({
  items,
  onComplete,
  onSkip,
  onItemClick,
}) => {
  if (items.length === 0) {
    return null;
  }

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
    <Table>
      <TableCaption>Lista de itens - Total: {items.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoria/Progresso</TableHead>
          <TableHead>Prioridade/Sequência</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isItemCompleted = 
            item.status === 'concluída' || 
            item.status === 'completed';
          
          const isItemCancelled = 
            item.status === 'cancelada' || 
            item.status === 'skipped';
            
          return (
            <TableRow 
              key={item.id} 
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => onItemClick(item)}
            >
              <TableCell className={`font-medium ${isItemCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {item.name}
              </TableCell>
              <TableCell>
                <Badge variant={item.type === 'task' ? 'outline' : 'default'} className={item.type === 'habit' ? 'bg-lime-600 text-black' : ''}>
                  {item.type === 'task' ? 'Tarefa' : 'Hábito'}
                </Badge>
              </TableCell>
              <TableCell>
                {item.type === 'task' && item.category ? (
                  <span>{item.category}</span>
                ) : item.type === 'habit' && item.target ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span>{item.current} / {item.target} {item.unit}</span>
                      <span>
                        {Math.round(((item.current || 0) / (item.target || 1)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(((item.current || 0) / (item.target || 1)) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              <TableCell>
                {item.type === 'task' && item.priority ? (
                  getPriorityBadge(item.priority)
                ) : item.type === 'habit' && item.streak !== undefined ? (
                  <div className="flex items-center">
                    <span className="font-bold">{item.streak}</span>
                    <span className="text-xs text-muted-foreground ml-1">dias</span>
                  </div>
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell 
                className={item.dueDate && isOverdue(item.dueDate) && !isItemCompleted ? 'text-red-600' : ''}
              >
                {item.dueDate ? (
                  format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Recorrente</span>
                )}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-green-100 hover:bg-green-200 text-green-800"
                    onClick={() => onComplete(item.id)}
                    disabled={isItemCompleted}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-red-100 hover:bg-red-200 text-red-800"
                    onClick={() => onSkip(item.id)}
                    disabled={isItemCancelled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TrackableItemList;
